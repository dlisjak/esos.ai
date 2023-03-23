import prisma from "@/lib/prisma";

import Loader from "@/components/Loader";
import Navigation from "../../components/Navbar";
import CategoryLayout from "../../components/CategoryLayout";
import Footer from "../../components/Footer";

export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: {
      parent: {
        is: null,
      },
    },
    select: {
      title: true,
      slug: true,
      image: true,
      posts: {
        select: {
          title: true,
          slug: true,
          category: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      site: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
    },
  });

  const paths = categories.flatMap((category) => {
    if (category.site === null || category.site.subdomain === null) return {};

    if (category.site.customDomain) {
      return {
        site: category.site.customDomain,
        category: category.slug,
      };
    } else {
      return {
        site: category.site.subdomain,
        category: category.slug,
      };
    }
  });

  return paths;
}

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

  if (!data || !categoryData) return <Loader />;

  const translation = categoryData?.translations[0]?.content || "";

  return (
    <>
      <Navigation categories={data.categories} title={data.name || ""} />
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        <CategoryLayout
          category={categoryData}
          translation={translation}
          user={data.user}
        />
      </div>
      <Footer site={data} />
    </>
  );
}
