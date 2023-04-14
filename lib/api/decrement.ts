import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";

import prisma from "@/lib/prisma";
import { PER_GENERATE } from "../consts/credits";

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
export async function decrementCredits(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const sessionId = session?.user?.id;
  const { contentLength } = req.body;

  if (!sessionId || !contentLength) {
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

    const creditsUsage = Math.ceil(contentLength / PER_GENERATE);

    const newUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        credits: {
          decrement: creditsUsage,
        },
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
