import prisma from "@/lib/prisma";

import Loader from "@/components/Loader";
import CategoryLayout from "../../components/CategoryLayout";
import Footer from "../../components/Footer";
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

  const data = await prisma.site.findUnique({
    where: filter,
    include: {
      user: true,
      categories: {
        select: {
          title: true,
          slug: true,
          children: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        where: {
          parentId: null,
        },
      },
    },
  });

  const category = await prisma.site.findUnique({
    where: filter,
    include: {
      categories: {
        where: {
          slug: categorySlug,
        },
        select: {
          title: true,
          slug: true,
          image: true,
          translations: {
            where: {
              lang,
            },
          },
          posts: {
            select: {
              title: true,
              slug: true,
              image: true,
              content: true,
              createdAt: true,
              category: {
                select: {
                  slug: true,
                  title: true,
                  translations: { where: { lang } },
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    data,
    categoryData: category?.categories[0],
  };
};

export default async function Category({
  params: { site, category, lang },
}: any) {
  const { categoryData, data } = await getData(site, category, lang);

  if (!data) return <Loader />;

  if (!categoryData) return notFound();

  const translation = categoryData?.translations[0]?.content || "";

  return (
    <>
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        <CategoryLayout
          category={categoryData}
          translation={translation}
          user={data.user}
        />
      </div>
    </>
  );
}
