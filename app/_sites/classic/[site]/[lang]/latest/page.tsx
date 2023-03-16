import prisma from "@/lib/prisma";

import type { _SiteData } from "@/types";
import Loader from "@/components/app/Loader";
import Navigation from "@/components/Sites/Navbar";
import LatestPosts from "../../components/LatestPosts";

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
      },
    },
  });

  return {
    latestPosts: latestPosts?.posts,
    data,
  };
};

export default async function Index({ params }: any) {
  const { latestPosts, data } = await getData(params.site);
  if (!data) return <Loader />;

  return (
    <>
      <Navigation categories={data.categories} title={data.name} />
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        {latestPosts && <LatestPosts posts={latestPosts} user={data.user} />}
      </div>
    </>
  );
}
