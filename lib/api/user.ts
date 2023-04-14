import prisma from "@/lib/prisma";

import type { Session } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Get Access Token
 *
 * Gets a user's accessToken.
 *
 * Once added, the status ifExists will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getUser(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const sessionId = session?.user?.id;

  if (!sessionId) {
    return res.status(400).json({
      error: "Missing or misconfigured accessToken or session ID",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: sessionId,
      },
    });

    if (!user) {
      return res.status(404).end("User not found");
    }

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update User
 *
 * Updates a user
 *
 * Once added, the status ifExists will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updateUser(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const sessionId = session?.user?.id;
  const { openAIKey } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: "Missing or misconfigured accessToken or session ID",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: sessionId,
      },
    });

    if (!user) {
      return res.status(404).end("User not found");
    }

    const newUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        openAIKey,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
