import prisma from "@/lib/prisma";

import { NextApiRequest, NextApiResponse } from "next";
import type { Post, Site } from "@prisma/client";
import type { Session } from "next-auth";
import { revalidate } from "@/lib/revalidate";
import { getBlurDataURL, placeholderBlurhash } from "@/lib/utils";

import type { WithSitePost } from "@/types";

interface AllPosts {
  posts: Array<Post>;
  site: Site | null;
}

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
): Promise<void | NextApiResponse<AllPosts | (WithSitePost | null)>> {
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
        category: true,
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
        image: `/placeholder.png`,
        imageBlurhash: placeholderBlurhash,
        site: {
          connect: {
            subdomain: subdomain,
          },
        },
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
    if (response?.site?.subdomain) {
      // revalidate for subdomain
      await revalidate(
        `https://${response.site?.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`, // hostname to be revalidated
        response.site.subdomain, // siteId
        response.slug // slugname for the post
      );
    }
    if (response?.site?.customDomain)
      // revalidate for custom domain
      await revalidate(
        `https://${response.site.customDomain}`, // hostname to be revalidated
        response.site.customDomain, // siteId
        response.slug // slugname for the post
      );

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
 *  - imageBlurhash
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
  const {
    id,
    title,
    content,
    categoryId,
    slug,
    image,
    published,
    subdomain,
    customDomain,
  } = req.body;

  if (!id || typeof id !== "string" || !categoryId || !session?.user?.id) {
    return res.status(400).json({
      error: "Missing or misconfigured post ID, CategoryId or session ID",
    });
  }

  try {
    const post = await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        title,
        content,
        categoryId,
        slug,
        image,
        imageBlurhash: (await getBlurDataURL(image)) ?? undefined,
        published,
      },
    });
    if (subdomain) {
      // revalidate for subdomain
      await revalidate(
        `https://${subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`, // hostname to be revalidated
        subdomain, // siteId
        slug // slugname for the post
      );
    }
    if (customDomain)
      // revalidate for custom domain
      await revalidate(
        `https://${customDomain}`, // hostname to be revalidated
        customDomain, // siteId
        slug // slugname for the post
      );

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
): Promise<void | NextApiResponse<Post[]>> {
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
): Promise<void | NextApiResponse<Post[]>> {
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
