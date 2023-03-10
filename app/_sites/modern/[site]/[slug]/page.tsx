import type { Metadata } from "next";
import { markdown } from "markdown";

import prisma from "@/lib/prisma";
import { toDateString } from "@/lib/utils";
import BlogCard from "@/components/BlogCard";
import Loader from "@/components/app/Loader";

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
      site: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
    },
  });

  const paths = posts.flatMap((post) => {
    if (post.site === null || post.site.subdomain === null) return {};

    if (post.site.customDomain) {
      return {
        site: post.site.customDomain,
        slug: post.slug,
      };
    } else {
      return {
        site: post.site.subdomain,
        slug: post.slug,
      };
    }
  });

  return paths;
}

const getData = async (params) => {
  if (!params) throw new Error("No path parameters found");

  const { site, slug } = params;

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

  const data = await prisma.post.findFirst({
    where: {
      site: {
        ...filter,
      },
      slug,
    },
    include: {
      site: {
        include: {
          user: true,
        },
      },
    },
  });

  const [adjacentPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        site: {
          ...filter,
        },
        published: true,
        NOT: {
          id: data?.id,
        },
      },
      select: {
        slug: true,
        title: true,
        createdAt: true,
        description: true,
        image: true,
      },
    }),
  ]);

  return {
    ...data,
    adjacentPosts,
  };
};

export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await getData(params);
  if (!data) return { title: "ESOS AI" };
  return { title: data.title };
}

export default async function Post({ params }) {
  const data = await getData(params);
  if (!data) return <Loader />;

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="m-auto w-full text-center">
          <p className="m-auto my-5 w-10/12 text-sm font-light text-gray-500 md:text-base">
            {data?.createdAt && toDateString(data?.createdAt)}
          </p>
          <h1 className="mb-10 text-3xl  font-bold text-gray-800 md:text-6xl">
            {data?.title}
          </h1>
        </div>
      </div>
      <article
        className="prose-md prose m-auto w-11/12 sm:prose-lg sm:w-3/4"
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: markdown.toHTML(data?.content) }}
      />

      {data?.adjacentPosts.length > 0 && (
        <div className="relative mt-10 mb-20 sm:mt-20">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">
              Continue Reading
            </span>
          </div>
        </div>
      )}
      {data?.adjacentPosts && (
        <div className="mx-5 mb-20 grid max-w-screen-lg grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:mx-12 xl:grid-cols-3 2xl:mx-auto">
          {data?.adjacentPosts.map((data, index) => (
            <BlogCard key={index} data={data} />
          ))}
        </div>
      )}
    </>
  );
}
