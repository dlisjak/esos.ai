import prisma from "@/lib/prisma";

import type { _SiteData } from "@/types";
import FeaturedPosts from "../components/FeaturedPosts";
import LatestPosts from "../components/LatestPosts";
import { getDictionary } from "app/dictionaries";

export const dynamicParams = true;

const getData = async (site: string, lang: string) => {
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

  const featuredPosts = await prisma.post.findMany({
    where: {
      site: filter,
      isFeatured: true,
      translations: {
        some: {
          lang,
        },
      },
    },
    select: {
      translations: {
        where: {
          lang,
        },
        select: {
          title: true,
          content: true,
        },
      },
      slug: true,
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
  });

  const latestPosts = await prisma.post.findMany({
    where: {
      site: filter,
      published: true,
      translations: {
        some: {
          lang,
        },
      },
    },
    select: {
      translations: {
        where: {
          lang,
        },
        select: {
          title: true,
          content: true,
        },
      },
      slug: true,
      image: true,
      createdAt: true,
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
  });

  return {
    featuredPosts: featuredPosts.map((post) => ({
      ...post,
      title: post.translations[0].title,
      content: post.translations[0].content,
    })),
    latestPosts: latestPosts.map((post) => ({
      ...post,
      title: post.translations[0].title,
      content: post.translations[0].content,
    })),
  };
};

export default async function Index({ params: { site, lang } }: any) {
  const { featuredPosts, latestPosts } = await getData(site, lang);
  const dict = await getDictionary(lang);

  return (
    <>
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        {featuredPosts && featuredPosts.length > 0 && (
          <FeaturedPosts
            featuredPosts={featuredPosts}
            dict={dict}
            lang={lang}
          />
        )}
        {latestPosts && latestPosts.length > 0 && (
          <LatestPosts posts={latestPosts} dict={dict} lang={lang} />
        )}
      </div>
    </>
  );
}
