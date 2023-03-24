import prisma from "@/lib/prisma";

import CategoryLayout from "../../components/CategoryLayout";
import { notFound } from "next/navigation";

export const dynamicParams = true;

const getData = async (site: string, categorySlug: string, lang: string) => {
  let filter: {
    subdomain?: string;
    customDomain?: string;
  } = {
    subdomain: site,
  };

  if (site.includes(".")) {
    filter = {
      customDomain: site,
    };
  }

  const category = await prisma.category.findFirst({
    where: {
      site: filter,
      slug: categorySlug,
      translations: {
        some: {
          lang,
        },
      },
    },
    select: {
      title: true,
      content: true,
      slug: true,
      image: true,
      translations: {
        where: {
          lang,
        },
        select: {
          title: true,
          content: true,
        },
      },
      posts: {
        where: {
          translations: {
            some: { lang },
          },
        },
        select: {
          title: true,
          slug: true,
          image: true,
          content: true,
          translations: {
            where: { lang },
          },
          createdAt: true,
          category: {
            select: {
              slug: true,
              title: true,
              translations: { where: { lang } },
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
  });

  const categoryData = {
    ...category,
    title: category?.translations[0].title || category?.title,
    content: category?.translations[0].content || category?.content,
    posts: category?.posts.map((post) => ({
      ...post,
      title: post.translations[0].title || post.title,
      content: post.translations[0].content || post.content,
    })),
  };

  return {
    categoryData,
  };
};

export default async function Category({
  params: { site, category, lang },
}: any) {
  const { categoryData } = await getData(site, category, lang);

  if (!categoryData || !categoryData.title || !categoryData.content)
    return notFound();

  return (
    <>
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        <CategoryLayout category={categoryData} lang={lang} />
      </div>
    </>
  );
}
