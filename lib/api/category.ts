import type { Session } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import type { Category } from ".prisma/client";
import { revalidate } from "@/lib/revalidate";

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
): Promise<void | NextApiResponse<Array<Category> | (Category | null)>> {
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
          posts: {
            include: {
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

    const site = await prisma.site.findFirst({
      where: {
        subdomain: subdomain,
        user: {
          id: session.user.id,
        },
      },
    });

    const categories = !site
      ? []
      : await prisma.category.findMany({
          where: {
            siteId: site.id,
          },
          orderBy: {
            title: "asc",
          },
          include: {
            parent: true,
            children: {
              include: {
                posts: true,
                children: {
                  include: {
                    posts: true,
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
        image: `/placeholder.png`,
        title,
        slug,
        site: {
          connect: {
            id: site.id,
          },
        },
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
 * Update Category
 *
 * Updates a category & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - description
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
  const { id, title, description, parentId, slug, image } = req.body;

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
    const category = await prisma.category.update({
      where: {
        id: id,
      },
      data: {
        title,
        description,
        slug,
        parentId: parent,
        image: image,
        imageBlurhash: undefined,
      },
    });

    return res.status(200).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
