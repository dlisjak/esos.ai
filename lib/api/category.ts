import type { Session } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import type { Category, CategoryTranslation } from ".prisma/client";
import { WithAllCategory } from "@/types/category";
import translate from "deepl";
import { revalidate } from "../revalidate";

/**
 * Get Category
 *
 * Fetches & returns either a single or all categories available depending on
 * whether a `siteId` query parameter is provided. If not all categories are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function getCategory(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<
  Array<WithAllCategory[]> | (WithAllCategory | null)
>> {
  const { subdomain, siteId, categoryId } = req.query;

  if (
    Array.isArray(categoryId) ||
    Array.isArray(subdomain) ||
    Array.isArray(siteId) ||
    !session.user.id
  )
    return res.status(400).end("Bad request. Query parameters are not valid.");

  try {
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          site: {
            user: {
              id: session.user.id,
            },
          },
        },
        include: {
          parent: true,
          image: true,
          translations: true,
          posts: {
            include: {
              image: true,
              category: true,
            },
            orderBy: [
              {
                isFeatured: "desc",
              },
              {
                createdAt: "desc",
              },
            ],
          },
        },
      });

      return res.status(200).json(category);
    }

    const categories = await prisma.category.findMany({
      where: {
        site: {
          subdomain,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        parent: true,
        image: true,
        children: {
          include: {
            posts: true,
            image: true,
            children: {
              include: {
                posts: true,
                image: true,
              },
            },
          },
        },
        posts: true,
      },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Category
 *
 * Creates a new category from a provided `siteId` query parameter.
 *
 * Once created, the sites new `categoryId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createCategory(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Array<Category> | (Category | null)>> {
  const { subdomain } = req.query;
  const { title, slug } = req.body;

  if (!subdomain || typeof subdomain !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  const site = await prisma.site.findFirst({
    where: {
      subdomain: subdomain,
      user: {
        id: session.user.id,
      },
    },
  });
  if (!site) return res.status(404).end("Site not found");

  try {
    const response = await prisma.category.create({
      data: {
        title,
        slug,
        site: {
          connect: {
            id: site.id,
          },
        },
      },
    });

    await prisma.categoryTranslation.create({
      data: {
        lang: "EN",
        categoryId: response.id,
        title,
      },
    });

    return res.status(201).json({
      categoryId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Category
 *
 * Deletes a category from the database using a provided `categoryId` query
 * parameter.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deleteCategory(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const { categoryId } = req.query;

  if (!categoryId || typeof categoryId !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  try {
    await prisma.categoryTranslation.deleteMany({
      where: {
        categoryId,
      },
    });

    const response = await prisma.category.delete({
      where: {
        id: categoryId,
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
 * Update Category
 *
 * Updates a category & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - content
 *  - slug
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updateCategory(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Category>> {
  const { id, title, content, parentId, slug, image } = req.body;

  const parent = parentId || null;

  if (!id || typeof id !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  const site = await prisma.site.findFirst({
    where: {
      categories: {
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
      slug,
    };

    if (parent) {
      data["parentId"] = parent;
    }

    if (image) {
      const imageResponse = await prisma.image.create({
        data: {
          src: image.src,
          alt: image.alt,
        },
      });

      data["imageId"] = imageResponse.id;
    }

    const category = await prisma.category.update({
      where: {
        id: id,
      },
      data,
    });

    await revalidate(site, "en", category);

    return res.status(200).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Get Category Translation
 *
 * Get a category translation
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - content
 *  - slug
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getCategoryTranslations(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<CategoryTranslation[]>> {
  const { categoryId } = req.query;

  if (!categoryId || typeof categoryId !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured categoryId or session ID" });
  }

  try {
    const translations = await prisma.categoryTranslation.findMany({
      where: {
        categoryId,
      },
    });

    return res.status(200).json(translations);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Category Translation
 *
 * Create category a translation
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - content
 *  - slug
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createCategoryTranslation(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<CategoryTranslation>> {
  const { subdomain } = req.query;
  const { lang, categoryId } = req.body;

  if (!subdomain || typeof subdomain !== "string" || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured subdomain or session ID" });
  }

  try {
    const exists = await prisma.categoryTranslation.findFirst({
      where: {
        lang,
        categoryId,
      },
    });

    if (exists) return res.status(200).json(exists);

    const translation = await prisma.categoryTranslation.create({
      data: {
        lang,
        categoryId,
      },
    });

    return res.status(200).json(translation);
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
        include: {
          category: {
            include: {
              parent: true,
              site: true,
            },
          },
        },
      });

      return res.status(200).json(translation);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
