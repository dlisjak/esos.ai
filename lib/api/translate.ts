import prisma from "@/lib/prisma";
import { WithSitePost } from "@/types/post";
import { CategoryTranslation } from "@prisma/client";

import { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import translate from "deepl";

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

/**
 * Translate Category
 *
 * Fetches & returns either a single or all languages available depending on
 * DeepL integration
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */

export async function translateCategory(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<CategoryTranslation | null>> {
  const { categoryId } = req.query;
  const { translationId, lang, title = "", content = "" } = req.body;

  if (!session.user.id || !translationId)
    return res.status(400).end("Bad request. User not validated.");

  try {
    if (!categoryId) {
      const translation = await prisma.categoryTranslation.update({
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

      const translation = await prisma.categoryTranslation.update({
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
