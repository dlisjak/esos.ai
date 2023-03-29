import prisma from "@/lib/prisma";

import { NextApiRequest, NextApiResponse } from "next";
import type { Post, PostTranslation } from "@prisma/client";
import type { Session } from "next-auth";
import { WithSitePost } from "@/types/post";
import translate from "deepl";
import { revalidate } from "../revalidate";
import getSlug from "speakingurl";
import { openai } from "../openai";
import { extractBrokenLinks, removeBrokenLinks } from "../links";

/**
 * Get Post
 *
 * Fetches & returns either a single or all posts available depending on
 * whether a `postId` query parameter is provided. If not all posts are
 * returned in descending order.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getPost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<WithSitePost[] | (WithSitePost | null)>> {
  const { postId, subdomain, categoryId, published } = req.query;

  if (
    Array.isArray(postId) ||
    Array.isArray(subdomain) ||
    Array.isArray(categoryId) ||
    Array.isArray(published) ||
    !session.user.id
  )
    return res.status(400).end("Bad request. Query parameters are not valid.");

  try {
    if (postId) {
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          site: {
            user: {
              id: session.user.id,
            },
          },
        },
        include: {
          site: true,
          category: true,
          image: true,
          translations: true,
        },
      });

      return res.status(200).json(post);
    }

    const posts = await prisma.post.findMany({
      where: {
        site: {
          subdomain: subdomain,
        },
        published: JSON.parse(published || "true"),
        categoryId: categoryId,
      },
      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        site: true,
        category: true,
        image: true,
        translations: true,
      },
    });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Post
 *
 * Creates a new post from a provided `siteId` query parameter.
 *
 * Once created, the sites new `postId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createPost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<{
  postId: string;
}>> {
  const { subdomain } = req.query;
  const { title, slug, categoryId } = req.body;

  if (!subdomain || typeof subdomain !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  try {
    const response = await prisma.post.create({
      data: {
        title,
        slug,
        categoryId,
        site: {
          connect: {
            subdomain: subdomain,
          },
        },
      },
    });

    await prisma.postTranslation.create({
      data: {
        lang: "EN",
        postId: response.id,
        title,
      },
    });

    return res.status(201).json({
      postId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Post
 *
 * Deletes a post from the database using a provided `postId` query
 * parameter.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deletePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const { postId } = req.query;

  if (!postId || typeof postId !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  try {
    await prisma.postTranslation.deleteMany({
      where: {
        postId,
      },
    });

    const response = await prisma.post.delete({
      where: {
        id: postId,
      },
      include: {
        site: {
          select: { subdomain: true, customDomain: true },
        },
      },
    });

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update Post
 *
 * Updates a post & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - description
 *  - content
 *  - slug
 *  - image
 *  - published
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updatePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Post>> {
  const { id, title, content, categoryId, slug, image, published } = req.body;

  if (!id || typeof id !== "string" || !categoryId || !session?.user?.id) {
    return res.status(400).json({
      error: "Missing or misconfigured post ID, CategoryId or session ID",
    });
  }

  const site = await prisma.site.findFirst({
    where: {
      posts: {
        some: {
          id: id,
        },
      },
      user: {
        id: session.user.id,
      },
    },
  });
  if (!site) return res.status(404).end("Site not found");

  try {
    const data: any = {
      title,
      content,
      categoryId,
      slug,
      published,
    };

    if (image) {
      const imageResponse = await prisma.image.create({
        data: {
          src: image.src ?? "/placeholder.png",
          alt: image.alt ?? title,
        },
      });

      data["imageId"] = imageResponse.id;
    }

    const post = await prisma.post.update({
      where: {
        id: id,
      },
      data,
      include: {
        translations: true,
        category: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (post) {
      await Promise.all(
        post.translations.map((translation) =>
          revalidate(
            site,
            translation.lang.toLocaleLowerCase(),
            post.category,
            post
          )
        )
      );
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Feature Post
 *
 * Features or unfeatures a post
 *  - id
 *  - isFeatured
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function featurePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Post>> {
  const { postId } = req.query;
  const { isFeatured } = req.body;

  if (!postId || typeof postId !== "string" || !session?.user?.id) {
    return res.status(400).json({
      error: "Missing or misconfigured post ID or session ID",
    });
  }

  try {
    const post = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        isFeatured,
      },
    });

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Get Post Translation
 *
 * Gets a post translation
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - content
 *  - slug
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getPostTranslations(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<PostTranslation[]>> {
  const { postId } = req.query;

  if (!postId || typeof postId !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured postId or session ID" });
  }

  try {
    const translations = await prisma.postTranslation.findMany({
      where: {
        postId,
      },
    });

    return res.status(200).json(translations);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Post Translation
 *
 * Create a post translation
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - content
 *  - slug
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createPostTranslation(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<PostTranslation>> {
  const { subdomain } = req.query;
  const { lang, postId } = req.body;

  if (!subdomain || typeof subdomain !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured subdomain or session ID" });
  }

  try {
    const exists = await prisma.postTranslation.findFirst({
      where: {
        lang,
        postId,
      },
    });

    if (exists) return res.status(200).json(exists);

    const translation = await prisma.postTranslation.create({
      data: {
        lang,
        postId,
      },
    });

    return res.status(200).json(translation);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Translate Post
 *
 * Fetches & returns either a single or all languages available depending on
 * DeepL integration
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */

export async function translatePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<PostTranslation | null>> {
  const { postId } = req.query;
  const { translationId, lang, title = "", content = "" } = req.body;

  if (!session.user.id || !translationId)
    return res.status(400).end("Bad request. User not validated.");

  try {
    if (!postId) {
      const translation = await prisma.postTranslation.update({
        where: {
          id: translationId,
        },
        data: {
          title,
          content,
        },
      });

      return res.status(200).json(translation);
    } else {
      const titleRes = await translate({
        text: title,
        target_lang: lang,
        auth_key: process.env.DEEPL_AUTH_KEY || "",
        free_api: false,
      });

      const contentRes = await translate({
        text: content,
        target_lang: lang,
        auth_key: process.env.DEEPL_AUTH_KEY || "",
        free_api: false,
      });

      const translatedTitle = titleRes.data.translations[0].text;
      const translatedContent = contentRes.data.translations[0].text;

      const translation = await prisma.postTranslation.update({
        where: {
          id: translationId,
        },
        data: {
          title: translatedTitle,
          content: translatedContent,
          excerpt: translatedContent.substring(0, 150),
        },
      });

      return res.status(200).json(translation);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Get Featured Posts
 *
 * Features or unfeatures a post
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getFeaturedPost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<WithSitePost[]>> {
  const { subdomain } = req.query;

  if (!subdomain || typeof subdomain !== "string" || !session?.user?.id) {
    return res.status(400).json({
      error: "Missing or misconfigured post ID or session ID",
    });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        site: {
          subdomain,
        },
        isFeatured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        image: true,
      },
    });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Get Latest Posts
 *
 * Fetches & returns latest posts by limit
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getLatestPosts(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<WithSitePost[]>> {
  const { subdomain, limit } = req.query;

  if (Array.isArray(limit) || Array.isArray(subdomain) || !session.user.id)
    return res.status(400).end("Bad request. Query parameters are not valid.");

  try {
    const posts = await prisma.post.findMany({
      take: limit ? Number(limit) : 5,
      where: {
        site: {
          subdomain: subdomain,
        },
      },
      select: {
        title: true,
        slug: true,
        published: true,
        translations: {
          select: {
            lang: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * import Posts
 *
 * Imports either a single or all posts available depending on
 * JSON input
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */

export async function importPosts(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<any | null>> {
  const { subdomain, posts, categoryId, bulkCreateContent, promptId } =
    req.body;

  if (!session.user.id || !subdomain || !posts || !categoryId)
    return res.status(400).end("Bad request.");

  const site = await prisma.site.findFirst({
    where: {
      subdomain,
      user: {
        id: session.user.id,
      },
    },
  });
  if (!site) return res.status(404).end("Site not found");

  const category = await prisma.category.findFirst({
    where: {
      siteId: site.id,
      id: categoryId,
    },
    select: {
      id: true,
      title: true,
      posts: {
        select: {
          slug: true,
        },
      },
      parent: {
        select: {
          slug: true,
        },
      },
    },
  });
  if (!category) return res.status(404).end("Category not found");

  let prompt: any = null;
  if (bulkCreateContent) {
    prompt = await prisma.prompt.findFirst({
      where: {
        id: promptId,
      },
    });
  }

  try {
    const response = await Promise.all(
      posts.filter(async (post: any) => {
        const regex = new RegExp(/\[(.*?)\]/g);
        const title = post.title.replaceAll(regex, category.title);
        const slug = getSlug(title);

        const duplicatePosts = category.posts.filter(
          (categoryPost) => categoryPost.slug === slug
        );
        if (duplicatePosts.length > 0) return false;

        const command = prompt?.command?.replaceAll(regex, title) ?? null;

        const data: any = {
          title,
          slug,
          published: post.published === "true" ? true : false,
          site: {
            connect: {
              id: site.id,
            },
          },
          category: {
            connect: {
              id: category.id,
            },
          },
          translations: {
            create: {
              title,
              lang: "EN",
            },
          },
        };

        if (command) {
          const contentResponse = await openai.createChatCompletion({
            model: "gpt-4-0314",
            messages: [{ role: "user", content: command }],
          });

          if (contentResponse) {
            const content =
              contentResponse?.data?.choices[0]?.message?.content.trim();
            if (content) {
              const brokenLinks = await extractBrokenLinks(content);
              const newMessage = removeBrokenLinks(content, brokenLinks);

              data["content"] = newMessage;
              data["translations"]["create"]["content"] = newMessage;
            }
          }
        }

        const p = await prisma.post.create({
          data,
          select: {
            slug: true,
          },
        });
        return { ...post, ...p };
      })
    );

    if (response) {
      await Promise.all(
        response.map((post) => {
          if (!post.slug) return;
          return revalidate(site, undefined, category, post);
        })
      );
    }

    return res.status(200).json(true);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
