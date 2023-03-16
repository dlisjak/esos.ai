import prisma from "@/lib/prisma";

import type { _SiteData } from "@/types";
import Loader from "@/components/app/Loader";
import Navigation from "@/components/Sites/Navbar";
import FeaturedPosts from "../components/FeaturedPosts";
import LatestPosts from "../components/LatestPosts";
import { getDictionary } from "app/dictionaries";

export const dynamicParams = true;

export async function generateStaticParams() {
  const [subdomains, customDomains] = await Promise.all([
    prisma.site.findMany({
      select: {
        subdomain: true,
      },
    }),
    prisma.site.findMany({
      where: {
        NOT: {
          customDomain: null,
        },
      },
      select: {
        customDomain: true,
      },
    }),
  ]);

  const allPaths = [
    ...subdomains.map(({ subdomain }) => subdomain),
    ...customDomains.map(({ customDomain }) => customDomain),
  ].filter((path) => path) as Array<string>;

  const paths = allPaths.map((path) => ({
    site: path,
  }));

  return paths;
}

const getData = async (site: any) => {
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

  const featuredPosts = await prisma.site.findFirst({
    where: filter,
    select: {
      posts: {
        where: {
          isFeatured: true,
        },
        select: {
          title: true,
          slug: true,
          content: true,
          image: true,
          createdAt: true,
          category: {
            select: {
              title: true,
              slug: true,
              parent: {
                select: {
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        take: 5,
      },
    },
  });

  const latestPosts = await prisma.site.findFirst({
    where: filter,
    select: {
      posts: {
        where: {
          published: true,
        },
        select: {
          title: true,
          slug: true,
          image: true,
          createdAt: true,
          content: true,
          category: {
            select: {
              slug: true,
              title: true,
              parent: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        take: 6,
      },
    },
  });

  return {
    featuredPosts: featuredPosts?.posts,
    latestPosts: latestPosts?.posts,
    data,
  };
};

export default async function Index({ params: { lang, site } }: any) {
  const dict = await getDictionary(lang);
  const { featuredPosts, latestPosts, data } = await getData(site);
  if (!data) return <Loader />;

  console.log(lang);
  console.log(dict);

  return (
    <>
      <Navigation categories={data.categories} title={data.name} />
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        {featuredPosts && featuredPosts.length > 0 && (
          <FeaturedPosts featuredPosts={featuredPosts} user={data.user} />
        )}
        {latestPosts && latestPosts.length > 0 && (
          <LatestPosts posts={latestPosts} user={data.user} />
        )}
      </div>
    </>
  );
}
