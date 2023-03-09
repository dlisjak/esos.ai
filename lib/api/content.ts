import prisma from "@/lib/prisma";
import axios from "axios";

import { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";

interface Detect {
  label: string;
  score: number;
}
[];

/**
 * Check Plagiarism
 *
 * Sends body of text to WriterAPI to check the AI detection score.
 * Returns real and fake objects
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function checkPlagiarism(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Detect>> {
  const { input } = req.body;

  if (Array.isArray(input) || !session.user.id)
    return res
      .status(400)
      .end("Bad request. promptId parameter cannot be an array.");

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID");

  try {
    const { data } = await axios.post(
      `https://enterprise-api.writer.com/content/organization/${process.env.WRITER_ORGANIZATION_ID}/detect`,
      { input: JSON.stringify(input) },
      {
        headers: {
          Authorization: `Bearer ${process.env.WRITER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
