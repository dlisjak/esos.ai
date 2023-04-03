import prisma from "@/lib/prisma";

import { NextApiRequest, NextApiResponse } from "next";
import type { Post, PostLink, PostTranslation } from "@prisma/client";
import type { Session } from "next-auth";
import { WithSitePost } from "@/types/post";
import translate from "deepl";
import { revalidate } from "../revalidate";
import getSlug from "speakingurl";
import { openai } from "../openai";
import { extractBrokenLinks, removeBrokenLinks } from "../links";
import {
  PER_IMPORT,
  PER_IMPORT_AND_GENERATE,
  PER_INTERLINK,
  PER_TRANSLATION,
} from "../consts/credits";
import { GPT_4 } from "../consts/gpt";

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
          links: {
            orderBy: {
              title: "asc",
            },
          },
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
        links: {
          orderBy: {
            title: "asc",
          },
        },
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
        links: {
          create: {
            title,
            href: slug,
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
    await prisma.post.delete({
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
      const imageExists = await prisma.image.findFirst({
        where: {
          src: image.src,
        },
      });

      if (imageExists) {
        data["imageId"] = imageExists.id;
      } else {
        const imageResponse = await prisma.image.create({
          data: {
            src: image.src ?? "/placeholder.png",
            alt: image.alt ?? title,
          },
        });
        data["imageId"] = imageResponse.id;
      }
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
          revalidate(site, translation.lang.toLowerCase(), post.category, post)
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

  const creditsUsage = Math.ceil(content.length / PER_TRANSLATION);

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      credits: true,
    },
  });
  if (!user || !user.credits) return res.status(400).end("User not found.");
  if (user.credits < creditsUsage)
    return res.status(400).end("Insufficient credits.");

  try {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        credits: {
          decrement: creditsUsage,
        },
      },
    });

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
        id: true,
        title: true,
        slug: true,
        published: true,
        translations: {
          select: {
            id: true,
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

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      credits: true,
    },
  });
  if (!user) return res.status(400).end("User not found.");
  if (!user.credits) return res.status(400).end("Not enough credits.");

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
          id: true,
          slug: true,
        },
      },
      parent: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });
  if (!category) return res.status(404).end("Category not found");

  const regex = new RegExp(/\[(.*?)\]/g);

  const filteredPosts = posts.filter((post: any) => {
    const title = post.title.replaceAll(regex, category.title);
    const slug = getSlug(title);

    const unique = category.posts.filter(
      (categoryPost) => categoryPost.slug !== slug
    );

    if (unique.length > 0) return true;
    return false;
  });

  const creditsUsage = Math.ceil(
    filteredPosts.length * bulkCreateContent
      ? PER_IMPORT_AND_GENERATE
      : PER_IMPORT
  );

  if (user.credits < creditsUsage)
    return res.status(400).end("Insufficient credits.");

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
      filteredPosts.map(async (post: any) => {
        const title = post.title.replaceAll(regex, category.title);
        const slug = getSlug(title);

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
          links: {
            create: {
              title,
              href: slug,
            },
          },
        };

        if (!!command) {
          const contentResponse = await openai.createChatCompletion({
            model: GPT_4,
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

              const p = await prisma.post.create({
                data,
                select: {
                  id: true,
                  slug: true,
                },
              });

              return { ...post, ...p };
            }
          }
        }

        return null;
      })
    );

    if (response) {
      const creditPerPost = bulkCreateContent
        ? PER_IMPORT_AND_GENERATE
        : PER_IMPORT;

      const creditsUsage = Math.ceil(response.length * creditPerPost);

      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          credits: {
            decrement: creditsUsage,
          },
        },
      });

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

/**
 * Create Post Link
 *
 * Creates single PostLink for a specific post
 * JSON input
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createPostLink(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<PostLink | null>> {
  const { postId, title, href } = req.body;

  if (!session.user.id || !postId || !title || !href)
    return res.status(400).end("Bad request.");

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
    },
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
          parent: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  const postLinkSlug = `/${
    post?.category?.parent
      ? post?.category?.parent?.slug + "/" + post?.category?.slug + "/"
      : post?.category?.slug + "/"
  }${post?.slug}`;

  try {
    const postLink = await prisma.postLink.create({
      data: {
        title,
        href: postLinkSlug,
        post: {
          connect: {
            id: postId,
          },
        },
      },
    });

    return res.status(200).json(postLink);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Post Link
 *
 * Deletes a single PostLink for a specific post
 * JSON input
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deletePostLink(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<PostLink | null>> {
  const { postId, linkId } = req.body;

  if (!session.user.id || !postId || !linkId)
    return res.status(400).end("Bad request.");

  try {
    const postLink = await prisma.postLink.delete({
      where: {
        id: linkId,
      },
    });

    return res.status(200).json(postLink);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Interlink Posts
 *
 * Interlinks posts from the category for a specific phrase
 * JSON input
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function interlinkPosts(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<PostLink | null>> {
  const { subdomain, postId, linkId, categoryId } = req.body;

  if (!session.user.id || !subdomain || !postId || !linkId || !categoryId)
    return res.status(400).end("Bad request.");

  const site = await prisma.site.findFirst({
    where: {
      subdomain,
      user: {
        id: session.user.id,
      },
    },
  });

  if (!site) return res.status(500).end("No Site Found.");

  const postLink = await prisma.postLink.findFirst({
    where: {
      id: linkId,
      post: {
        site: {
          user: {
            id: session.user.id,
          },
        },
      },
    },
  });

  if (!postLink?.href || !postLink.title)
    return res.status(500).end("No PostLink Found.");

  const translations = await prisma.postTranslation.findMany({
    where: {
      post: {
        id: {
          not: postId,
        },
        site: {
          user: {
            id: session.user.id,
          },
        },
      },
      OR: [
        {
          content: {
            contains: `${postLink.title} `,
          },
        },
        {
          content: {
            contains: `${postLink.title}`,
          },
        },
        {
          content: {
            contains: `${postLink.title}.`,
          },
        },
        {
          content: {
            contains: ` ${postLink.title} `,
          },
        },
        {
          content: {
            contains: ` ${postLink.title}.`,
          },
        },
        {
          content: {
            contains: ` ${postLink.title},`,
          },
        },
      ],
      NOT: {
        content: {
          contains: `[${postLink.title}]`,
        },
      },
    },
    select: {
      id: true,
      content: true,
      post: {
        select: {
          id: true,
          slug: true,
          category: {
            select: {
              slug: true,
              parent: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const translationSlugs = translations.map((translation) => {
    if (!translation.content || !postLink.title || !postLink.href)
      return { ...translation, content: translation.content };
    const linkedContent = translation.content.replace(
      postLink?.title,
      `[${postLink.title}](${postLink?.href})`
    );
    return { ...translation, content: linkedContent };
  });

  try {
    const response = await Promise.all(
      translationSlugs.map(async (translation) => {
        const updatedPost = await prisma.postTranslation.update({
          where: {
            id: translation.id,
          },
          data: {
            content: translation.content,
          },
          select: {
            id: true,
            post: {
              select: {
                id: true,
                slug: true,
                category: {
                  select: {
                    slug: true,
                    parent: {
                      select: {
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return updatedPost;
      })
    );

    if (response) {
      const creditPerPost = PER_INTERLINK;

      const creditsUsage = Math.ceil(response.length * creditPerPost);

      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          credits: {
            decrement: creditsUsage,
          },
        },
      });

      await Promise.all(
        response.map(({ post }) => {
          if (!post.slug) return;
          return revalidate(site, undefined, post.category, post);
        })
      );
    }

    return res.status(200).json(translations);
  } catch (error) {
    return res.status(500).end(error);
  }
}
