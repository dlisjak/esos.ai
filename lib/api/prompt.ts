import type { Session } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import { openai } from "@/lib/openai";

import type { Prompt } from ".prisma/client";
import { extractBrokenLinks, removeBrokenLinks } from "../links";
import { GPT_3, GPT_4 } from "../consts/gpt";

/**
 * Get Prompt
 *
 * Fetches & returns either a single or all user prompts available depending on
 * whether a `promptId` query parameter is provided. If not all themes are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function getPrompt(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Array<Prompt> | (Prompt | null)>> {
  const { promptId } = req.query;

  if (Array.isArray(promptId) || !session.user.id)
    return res
      .status(400)
      .end("Bad request. promptId parameter cannot be an array.");

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID");

  try {
    if (promptId) {
      const prompt = await prisma.prompt.findFirst({
        where: {
          id: promptId,
          user: {
            id: session.user.id,
          },
        },
      });

      if (!prompt) return res.status(500).end("Invalid promptId");

      return res.status(200).json(prompt);
    }

    const prompts = await prisma.prompt.findMany({
      where: {
        user: {
          id: session.user.id,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json(prompts);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Prompt
 *
 * Creates a new prompt.
 *
 * Once created, the new `prompt` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createPrompt(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<{
  prompt: string;
}>> {
  const { name, description, command, hint } = req.body;

  if (!name || typeof command !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  try {
    const response = await prisma.prompt.create({
      data: {
        name,
        description,
        command,
        hint,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return res.status(201).json({
      prompt: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update Prompt
 *
 * Updates a new prompt.
 *
 * Once updated, the new `prompt` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updatePrompt(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<{
  prompt: string;
}>> {
  const { promptId } = req.query;
  const { name, description, command, hint } = req.body;

  if (
    !name ||
    typeof command !== "string" ||
    typeof promptId !== "string" ||
    !session?.user?.id
  ) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  try {
    const response = await prisma.prompt.update({
      where: {
        id: promptId,
      },
      data: {
        name,
        description,
        command,
        hint,
        tested: false,
      },
    });

    return res.status(201).json({
      prompt: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Prompt
 *
 * Deletes a new prompt.
 *
 * Once Deleted, the status will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deletePrompt(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<{
  prompt: string;
}>> {
  const { promptId } = req.query;

  if (!promptId || typeof promptId !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  try {
    const response = await prisma.prompt.delete({
      where: {
        id: promptId,
      },
    });

    return res.status(201).json({
      prompt: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Use Prompt
 *
 * Generates response from ChatGPT using a selected prompt.
 *
 * Once generated, the `response` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function generate(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<{
  message: string;
}>> {
  const sessionId = session?.user?.id;
  const { promptId, promptVariable } = req.body;

  if (
    !session.user.id ||
    !promptId ||
    typeof promptId !== "string" ||
    !sessionId
  ) {
    return res.status(400).json({
      error:
        "Missing or misconfigured accessToken, command, site ID or session ID",
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      isSubscribed: true,
    },
  });

  if (!user) return res.status(500).end("User not found");

  const prompt = await prisma.prompt.findFirst({
    where: {
      id: promptId,
      user: {
        id: sessionId,
      },
    },
  });

  if (!prompt || !prompt.command) return res.status(500).end("Invalid prompt");

  try {
    const regex = new RegExp(/\[(.*?)\]/g);

    const command = prompt.command.replaceAll(regex, promptVariable);

    const response = await openai.createChatCompletion({
      model: user.isSubscribed ? GPT_4 : GPT_3,
      messages: [{ role: "user", content: command }],
    });

    const message = response?.data?.choices[0]?.message?.content.trim();

    if (!message) {
      return res.status(400).json({
        error: "No message returned",
      });
    }

    await prisma.user.update({
      where: {
        id: sessionId,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    const brokenLinks = await extractBrokenLinks(message);
    const newMessage = removeBrokenLinks(message, brokenLinks);

    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).end(error);
  }
}

/**
 * Test Prompt
 *
 * Tests a new prompt.
 *
 * Once tested, the `response` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function testPrompt(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<{
  prompt: string;
}>> {
  const sessionId = session?.user?.id;
  const { promptId } = req.query;
  const { command } = req.body;

  if (
    !command ||
    typeof command !== "string" ||
    !promptId ||
    typeof promptId !== "string" ||
    !sessionId
  ) {
    return res.status(400).json({
      error:
        "Missing or misconfigured accessToken, command, site ID or session ID",
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

    const response = await openai.createChatCompletion({
      model: GPT_3,
      messages: [{ role: "user", content: command }],
    });

    const message = response?.data?.choices[0]?.message?.content;

    if (!message) {
      return res.status(400).json({
        error: "No message returned",
      });
    }

    await prisma.user.update({
      where: {
        id: sessionId,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    const prompt = await prisma.prompt.update({
      where: {
        id: promptId,
      },
      data: {
        tested: true,
      },
      select: {
        tested: true,
      },
    });

    return res.status(201).json({
      tested: prompt.tested,
      message: message.trim(),
    });
  } catch (error) {
    return res.status(500).end(error);
  }
}

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
export async function getAccessToken(
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

    return res.status(201).json({
      hasAccessToken: !!user?.accessToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Add Access Token
 *
 * Adds a new accessToken.
 *
 * Once added, the status will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function addAccessToken(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const { accessToken } = req.body;

  if (!accessToken || !session?.user?.id) {
    return res.status(400).json({
      error: "Missing or misconfigured accessToken or session ID",
    });
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        accessToken,
      },
    });

    return res.status(201).json({
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Remove Access Token
 *
 * Removes the accessToken.
 *
 * Once removed, the status will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function removeAccessToken(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const { accessToken } = req.body;

  if (!accessToken || !session?.user?.id) {
    return res.status(400).json({
      error: "Missing or misconfigured accessToken or session ID",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
      },
    });

    return res.status(201).json({
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
