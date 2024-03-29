import type { Session } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import wp from "@/lib/wp";
import type { Category, CategoryTranslation } from ".prisma/client";
import { WithAllCategory } from "@/types/category";
import translate from "deepl";
import getSlug from "speakingurl";
import { revalidate } from "../revalidate";
import {
  PER_IMPORT,
  PER_IMPORT_AND_GENERATE,
  PER_TRANSLATION,
} from "../consts/credits";
import { openai } from "../openai";
import { GPT_4 } from "../consts/gpt";
import { revalidateMainCategories } from "../revalidateImportCategories";
import { convertPosts } from "./post";

const convertCategories = (categories: any) => {
  if (categories.length > 1) {
    const newCategories = categories.map((category: any) => ({
      id: String(category.id),
      title: category.name,
      slug: category.slug,
      content: category.description || null,
      siteId: null, // Assuming no corresponding field in category object
      parentId: category.parent ? String(category.parent) : null,
      createdAt: new Date(), // Assuming current date for creation
      updatedAt: new Date(), // Assuming current date for last update
      imageId: null, // Assuming no corresponding field in original object
      isWordpress: true,
    }));

    return newCategories;
  } else {
    return {
      id: String(categories.id),
      title: categories.name,
      slug: categories.slug,
      content: categories.description || null,
      siteId: null, // Assuming no corresponding field in categories object
      parentId: categories.parent ? String(categories.parent) : null,
      createdAt: new Date(), // Assuming current date for creation
      updatedAt: new Date(), // Assuming current date for last update
      imageId: null, // Assuming no corresponding field in original object
      isWordpress: true,
    };
  }
};

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
  const { subdomain, siteId, categoryId, isWordpress } = req.query;

  const isWp = isWordpress === "true";

  if (
    Array.isArray(categoryId) ||
    Array.isArray(subdomain) ||
    Array.isArray(siteId) ||
    !session.user.id
  )
    return res.status(400).end("Bad request. Query parameters are not valid.");

  try {
    if (isWp) {
      const site = await prisma.site.findFirst({
        where: {
          userId: session.user.id,
        },
        select: {
          isWordpress: true,
          wpConfig: true,
        },
      });

      if (!site?.isWordpress || !site?.wpConfig)
        return res.status(400).end("Bad request. Site has invalid Config.");

      if (categoryId) {
        const category = await wp(
          site.wpConfig.endpoint,
          site.wpConfig.username,
          site.wpConfig.password
        )
          .categories()
          .id(Number(categoryId));

        const categoryPosts = await wp(
          site.wpConfig.endpoint,
          site.wpConfig.username,
          site.wpConfig.password
        )
          .posts()
          .categories(categoryId);

        const convertedCategory = convertCategories(category);
        const convertedcategoryPosts = convertPosts(categoryPosts);

        convertedCategory.posts = convertedcategoryPosts;

        return res.status(200).json(convertedCategory);
      } else {
        const categories = await wp(
          site.wpConfig.endpoint,
          site.wpConfig.username,
          site.wpConfig.password
        ).categories();

        const convertedCategories = convertCategories(categories);

        return res.status(200).json(convertedCategories);
      }
    } else {
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
                translations: true,
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
          translations: true,
          children: {
            include: {
              posts: true,
              image: true,
              translations: true,
              children: {
                include: {
                  posts: true,
                  image: true,
                  translations: true,
                  children: {
                    include: {
                      posts: true,
                      image: true,
                      translations: true,
                      children: {
                        include: {
                          posts: true,
                          image: true,
                          translations: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          posts: true,
        },
      });

      return res.status(200).json(categories);
    }
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
  const { title, slug, description, isWordpress } = req.body;

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
    select: {
      id: true,
      isWordpress: true,
      wpConfig: true,
    },
  });
  if (!site) return res.status(404).end("Site not found");

  try {
    if (isWordpress) {
      const response = await wp(
        site.wpConfig?.endpoint as string,
        site.wpConfig?.username as string,
        site.wpConfig?.password as string
      )
        .categories()
        .create({
          name: title,
          ...(slug ? { slug } : undefined),
          ...(description ? { description } : undefined),
        });

      const convertedCategory = convertCategories(response);

      console.log({ convertedCategory });
      return res.status(200).json(convertedCategory);
    } else {
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
    }
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
  const { categoryId, isWordpress, subdomain } = req.query;

  const isWp = isWordpress === "true";

  if (
    !categoryId ||
    typeof categoryId !== "string" ||
    typeof subdomain !== "string" ||
    !session?.user?.id
  ) {
    return res
      .status(400)
      .json({ error: "Missing or misconfigured site ID or session ID" });
  }

  try {
    if (isWp) {
      const site = await prisma.site.findFirst({
        where: {
          subdomain,
          userId: session.user.id,
        },
        select: {
          isWordpress: true,
          wpConfig: true,
        },
      });

      if (!site?.isWordpress || !site?.wpConfig)
        return res.status(400).end("Bad request. Site has invalid Config.");

      await wp(
        site.wpConfig.endpoint,
        site.wpConfig.username,
        site.wpConfig.password
      )
        .categories()
        .id(Number(categoryId))
        .param("force", "true")
        .delete();

      return res.status(200).end();
    } else {
      const site = await prisma.site.findFirst({
        where: {
          user: {
            id: session.user.id,
          },
          categories: {
            some: {
              id: categoryId,
            },
          },
        },
      });

      if (!site) return res.status(400).json({ error: "Cannot find site" });

      await prisma.category.delete({
        where: {
          id: categoryId,
        },
        include: {
          translations: true,
        },
      });

      return res.status(200).end();
    }
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
  const { id, title, parentId, slug, image } = req.body;

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
      slug,
      parentId: parent,
    };

    if (image) {
      const imageExists = await prisma.image.findFirst({
        where: {
          src: image.src,
        },
      });

      if (imageExists) {
        data["imageId"] = imageExists.id;
      } else {
        const imageResponse = await prisma.image.create({
          data: {
            src: image.src ?? "/placeholder.png",
            alt: image.alt ?? title,
            user: {
              connect: {
                id: session.user.id,
              },
            },
          },
        });
        data["imageId"] = imageResponse.id;
      }
    }

    const category = await prisma.category.update({
      where: {
        id: id,
      },
      data,
      select: {
        slug: true,
        translations: true,
        parent: {
          select: {
            slug: true,
            parent: {
              select: {
                slug: true,
                parent: {
                  select: {
                    slug: true,
                    parent: {
                      select: {
                        slug: true,
                        parent: {
                          select: {
                            slug: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (category) {
      await Promise.all(
        category.translations.map((translation) =>
          revalidate(site, translation.lang.toLowerCase(), category, null)
        )
      );
    }

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
  const {
    translationId,
    lang,
    title = "",
    content = "",
    chargeForTranslation,
  } = req.body;

  if (!session.user.id || !translationId)
    return res.status(400).end("Bad request. User not validated.");

  const creditsUsage = Math.ceil(content.length / PER_TRANSLATION);

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      credits: true,
      openAIKey: true,
    },
  });

  if (!user) return res.status(400).end("User not found.");

  if (chargeForTranslation) {
    if (!user.credits) return res.status(400).end("Insufficient credits.");
    if (user.credits < creditsUsage)
      return res.status(400).end("Insufficient credits.");

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        credits: {
          decrement: creditsUsage,
        },
      },
    });
  }

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

export async function revalidateCategories(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<any>> {
  const { subdomain, mainCategories } = req.body;

  if (!session.user.id)
    return res.status(400).end("Bad request. User not validated.");

  const site = await prisma.site.findFirst({
    where: {
      subdomain,
      user: {
        id: session.user.id,
      },
    },
  });
  if (!site) return res.status(404).end("Site not found");

  try {
    if (!!mainCategories[0]) {
      await Promise.all(
        mainCategories.map((category: Category) =>
          revalidateMainCategories(site, undefined, category)
        )
      );
    }
  } catch (err) {}
}

/**
 * import Categories
 *
 * Imports either a single or all categories available depending on
 * JSON input
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */

export async function importCategories(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<any | null>> {
  const { subdomain, categories, bulkCreateContent, promptId, isWordpress } =
    req.body;

  if (!session.user.id || !subdomain || !categories)
    return res.status(400).end("Bad request.");

  const site = await prisma.site.findFirst({
    where: {
      subdomain,
      user: {
        id: session.user.id,
      },
    },
    select: {
      isWordpress: true,
      wpConfig: true,
      id: true,
      subdomain: true,
      customDomain: true,
    },
  });
  if (!site) return res.status(404).end("Site not found");

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      credits: true,
    },
  });

  if (!user) return res.status(400).end("User not found.");
  if (!user.credits) return res.status(400).end("Not enough credits.");
  if (
    isWordpress &&
    (!site.wpConfig?.endpoint ||
      !site.wpConfig?.username ||
      !site.wpConfig?.password)
  )
    return;

  const siteCategories = isWordpress
    ? await wp(
        site.wpConfig?.endpoint as string,
        site.wpConfig?.username as string,
        site.wpConfig?.password as string
      ).categories()
    : await prisma.category.findMany({
        where: {
          site: {
            id: site.id,
          },
        },
        select: {
          title: true,
          slug: true,
        },
      });

  const regex = new RegExp(/\[(.*?)\]/g);

  const filteredCategories = categories.filter((category: any) => {
    const title = category.title.replaceAll(regex, category.title);
    const slug = getSlug(title);

    const exists = siteCategories.filter(
      (siteCategory: any) => siteCategory.slug === slug
    );

    if (exists.length > 0) return false;
    return true;
  });

  let prompt: any = null;
  if (bulkCreateContent) {
    prompt = await prisma.prompt.findFirst({
      where: {
        id: promptId,
      },
    });
  }

  try {
    if (isWordpress) {
      const generateWPCategory = async (category: any) => {
        const data: any = {
          name: category.title,
          ...(category.slug ? { slug: category.slug } : undefined),
        };

        const command =
          prompt?.command?.replaceAll(regex, category.title) ?? null;

        if (!!command) {
          const contentResponse = await openai.createChatCompletion({
            model: GPT_4,
            messages: [{ role: "user", content: command }],
          });

          if (contentResponse) {
            const content =
              contentResponse?.data?.choices[0]?.message?.content.trim();

            if (content) {
              data.description = content;
            }
          }
        }

        await wp(
          site.wpConfig?.endpoint as string,
          site.wpConfig?.username as string,
          site.wpConfig?.password as string
        )
          .categories()
          .create(data)
          .then((res) => res);
      };

      res.status(200).end();
    } else {
      const mainCategories = await Promise.all(
        filteredCategories.map(async (category: any) => {
          if (!category.title) return null;

          const data: any = {
            title: category.title,
            slug: category.slug ?? getSlug(category.title),
            site: {
              connect: {
                id: site.id,
              },
            },
            translations: {
              create: {
                lang: "EN",
              },
            },
          };

          if (category.imageId) {
            data.image = {};
            data.image.connect = {};
            data.image.connect.id = category.imageId;
          }

          const command =
            prompt?.command?.replaceAll(regex, category.title) ?? null;

          if (!!command) {
            const contentResponse = await openai.createChatCompletion({
              model: GPT_4,
              messages: [{ role: "user", content: command }],
            });

            if (contentResponse) {
              const content =
                contentResponse?.data?.choices[0]?.message?.content.trim();
              if (content) {
                data["content"] = content;
                data["translations"]["create"]["content"] = content;

                const cat = await prisma.category.create({
                  data,
                  select: {
                    id: true,
                    slug: true,
                  },
                });

                return { ...category, ...cat };
              }
            }
          } else {
            const cat = await prisma.category.create({
              data: {
                title: "",
                imageId: "",
              },
              select: {
                id: true,
                slug: true,
              },
            });

            return { ...category, ...cat };
          }
        })
      );

      const subCategories = await Promise.all(
        mainCategories
          .map((category: any) =>
            category.children
              ?.map(async (subCategory: any) => {
                if (!subCategory.title) return null;

                const command =
                  prompt?.command?.replaceAll(regex, subCategory.title) ?? null;

                const data: any = {
                  title: subCategory.title,
                  slug: subCategory.slug ?? getSlug(subCategory.title),
                  parent: {
                    connect: {
                      id: category.id,
                    },
                  },
                  site: {
                    connect: {
                      id: site.id,
                    },
                  },
                  translations: {
                    create: {
                      lang: "EN",
                    },
                  },
                };

                if (subCategory.imageId) {
                  data.image = {};
                  data.image.connect = {};
                  data.image.connect.id = subCategory.imageId;
                }

                if (!!command) {
                  const contentResponse = await openai.createChatCompletion({
                    model: GPT_4,
                    messages: [{ role: "user", content: command }],
                  });

                  if (contentResponse) {
                    const content =
                      contentResponse?.data?.choices[0]?.message?.content.trim();
                    if (content) {
                      data["content"] = content;
                      data["translations"]["create"]["content"] = content;

                      const subcat = await prisma.category.create({
                        data,
                        select: {
                          id: true,
                          slug: true,
                        },
                      });

                      return { ...subCategory, ...subcat };
                    }
                  }
                } else {
                  const subcat = await prisma.category.create({
                    data,
                    select: {
                      id: true,
                      slug: true,
                    },
                  });

                  return { ...subCategory, ...subcat };
                }
              })
              .flat()
          )
          .flat()
      );

      const subSubCategories = await Promise.all(
        subCategories
          .map((subCategory: any) =>
            subCategory.children
              ?.map(async (subSubCategory: any) => {
                if (!subSubCategory.title) return null;

                const command = prompt?.command?.replaceAll(
                  regex,
                  subSubCategory.title
                );

                const data: any = {
                  title: subSubCategory.title,
                  slug: subSubCategory.slug ?? getSlug(subSubCategory.title),
                  site: {
                    connect: {
                      id: site.id,
                    },
                  },
                  parent: {
                    connect: {
                      id: subCategory.id,
                    },
                  },
                  translations: {
                    create: {
                      lang: "EN",
                    },
                  },
                };

                if (subSubCategory.imageId) {
                  data.image = {};
                  data.image.connect = {};
                  data.image.connect.id = subSubCategory.imageId;
                }

                if (!!command) {
                  const contentResponse = await openai.createChatCompletion({
                    model: GPT_4,
                    messages: [{ role: "user", content: command }],
                  });

                  if (contentResponse) {
                    const content =
                      contentResponse?.data?.choices[0]?.message?.content.trim();
                    if (content) {
                      data["content"] = content;
                      data["translations"]["create"]["content"] = content;

                      const subSubCat = await prisma.category.create({
                        data,
                        select: {
                          id: true,
                          slug: true,
                        },
                      });

                      return { ...subSubCategory, ...subSubCat };
                    }
                  }
                } else {
                  const subSubCat = await prisma.category.create({
                    data,
                    select: {
                      id: true,
                      slug: true,
                    },
                  });

                  return { ...subSubCategory, ...subSubCat };
                }
              })
              .flat()
          )
          .flat()
      );

      const subSubSubCategories = await Promise.all(
        subSubCategories
          .map((subSubCategory: any) =>
            subSubCategory.children
              ?.map(async (subSubSubCategory: any) => {
                if (!subSubSubCategory.title) return null;

                const command = prompt?.command?.replaceAll(
                  regex,
                  subSubSubCategory.title
                );

                const data: any = {
                  title: subSubSubCategory.title,
                  slug:
                    subSubSubCategory.slug ?? getSlug(subSubSubCategory.title),
                  site: {
                    connect: {
                      id: site.id,
                    },
                  },
                  parent: {
                    connect: {
                      id: subSubCategory.id,
                    },
                  },
                  translations: {
                    create: {
                      lang: "EN",
                    },
                  },
                };

                if (subSubSubCategory.imageId) {
                  data.image = {};
                  data.image.connect = {};
                  data.image.connect.id = subSubSubCategory.imageId;
                }

                if (!!command) {
                  const contentResponse = await openai.createChatCompletion({
                    model: GPT_4,
                    messages: [{ role: "user", content: command }],
                  });

                  if (contentResponse) {
                    const content =
                      contentResponse?.data?.choices[0]?.message?.content.trim();
                    if (content) {
                      data["content"] = content;
                      data["translations"]["create"]["content"] = content;

                      const subSubCat = await prisma.category.create({
                        data,
                        select: {
                          id: true,
                          slug: true,
                        },
                      });

                      return { ...subSubSubCategory, ...subSubCat };
                    }
                  }
                } else {
                  const subSubCat = await prisma.category.create({
                    data,
                    select: {
                      id: true,
                      slug: true,
                    },
                  });

                  return { ...subSubSubCategory, ...subSubCat };
                }
              })
              .flat()
          )
          .flat()
      );

      const subSubSubSubCategories = await Promise.all(
        subSubSubCategories
          .map((subSubSubCategory: any) =>
            subSubSubCategory.children
              ?.map(async (subSubSubSubCategory: any) => {
                if (!subSubSubSubCategory.title) return null;

                const command = prompt?.command?.replaceAll(
                  regex,
                  subSubSubSubCategory.title
                );

                const data: any = {
                  title: subSubSubSubCategory.title,
                  slug:
                    subSubSubSubCategory.slug ??
                    getSlug(subSubSubSubCategory.title),
                  site: {
                    connect: {
                      id: site.id,
                    },
                  },
                  parent: {
                    connect: {
                      id: subSubSubCategory.id,
                    },
                  },
                  translations: {
                    create: {
                      lang: "EN",
                    },
                  },
                };

                if (subSubSubSubCategory.imageId) {
                  data.image = {};
                  data.image.connect = {};
                  data.image.connect.id = subSubSubSubCategory.imageId;
                }

                if (!!command) {
                  const contentResponse = await openai.createChatCompletion({
                    model: GPT_4,
                    messages: [{ role: "user", content: command }],
                  });

                  if (contentResponse) {
                    const content =
                      contentResponse?.data?.choices[0]?.message?.content.trim();
                    if (content) {
                      data["content"] = content;
                      data["translations"]["create"]["content"] = content;

                      const subSubCat = await prisma.category.create({
                        data,
                        select: {
                          id: true,
                          slug: true,
                        },
                      });

                      return { ...subSubSubSubCategory, ...subSubCat };
                    }
                  }
                } else {
                  const subSubCat = await prisma.category.create({
                    data,
                    select: {
                      id: true,
                      slug: true,
                    },
                  });

                  return { ...subSubSubSubCategory, ...subSubCat };
                }
              })
              .flat()
          )
          .flat()
      );

      if (!!subSubSubSubCategories[0]) {
        await Promise.all(
          subSubSubCategories.map((category) =>
            revalidate(site, undefined, category, undefined)
          )
        );
      } else if (!!subSubSubCategories[0]) {
        await Promise.all(
          subSubSubCategories.map((category) =>
            revalidate(site, undefined, category, undefined)
          )
        );
      } else if (!!subSubCategories[0]) {
        await Promise.all(
          subSubCategories.map((category) =>
            revalidate(site, undefined, category, undefined)
          )
        );
      } else if (!!subCategories[0]) {
        await Promise.all(
          subCategories.map((category) =>
            revalidate(site, undefined, category, undefined)
          )
        );
      } else if (!!mainCategories[0]) {
        await Promise.all(
          mainCategories.map((category) =>
            revalidate(site, undefined, category, undefined)
          )
        );
      }

      return res.status(200).json({
        mainCategories,
        subCategories,
        subSubCategories,
        subSubSubCategories,
        subSubSubSubCategories,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
