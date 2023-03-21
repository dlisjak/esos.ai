import { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";

/**
 * Get Available Translation Languages
 *
 * Fetches & returns either a single or all languages available depending on
 * DeepL integration
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */

export interface Language {
  language: string;
  name: string;
}

export async function getLanguages(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Language[] | null>> {
  if (!session.user.id)
    return res.status(400).end("Bad request. User not validated.");

  try {
    const response = await fetch(`${process.env.DEEPL_ENDPOINT}/v2/languages`, {
      headers: {
        Authorization: `DeepL-Auth-Key ${process.env.DEEPL_AUTH_KEY}`,
      },
    });

    const languages: Language[] = await response.json();

    return res.status(200).json(languages);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
