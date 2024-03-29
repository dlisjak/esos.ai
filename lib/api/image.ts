import { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import prisma from "@/lib/prisma";

import type { Image } from ".prisma/client";

/**
 * Get Image
 *
 * Fetches & returns either a single or all images available depending on
 * whether a `imageId` query parameter is provided. If not all images are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function getImage(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Array<Image> | (Image | null)>> {
  const { imageId } = req.body;

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID");

  try {
    if (imageId) {
      const image = await prisma.image.findFirst({
        where: {
          id: imageId,
          user: {
            id: session.user.id,
          },
        },
      });

      return res.status(200).json(image);
    }

    const images = await prisma.image.findMany({
      where: {
        user: {
          id: session.user.id,
        },
      },
      orderBy: {
        alt: "asc",
      },
    });

    return res.status(200).json(images);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
