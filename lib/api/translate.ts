import prisma from "@/lib/prisma";
import { WithSitePost } from "@/types/post";

import { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";

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
export async function translatePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<WithSitePost | null>> {
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
    const posts = await prisma.post.findMany({
      where: {
        site: {
          subdomain: subdomain,
        },
        published: JSON.parse(published || "true"),
        categoryId: categoryId,
      },
    });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
