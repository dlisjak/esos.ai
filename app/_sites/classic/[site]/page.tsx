import Link from "next/link";

import BlogCard from "@/components/BlogCard";
import prisma from "@/lib/prisma";

import type { _SiteData } from "@/types";
import { toDateString } from "@/lib/utils";
import Loader from "@/components/app/Loader";
import { Metadata } from "next";
import Image from "next/image";
import Navigation from "@/components/Sites/Navbar";

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

const getData = async (site) => {
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
      posts: {
        where: {
          published: true,
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        select: {
          title: true,
          slug: true,
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
          image: true,
          content: true,
          createdAt: true,
        },
        take: 5,
      },
    },
  });

  return data;
};

export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await getData(params.site);
  if (!data) return { title: "ESOS AI", description: "ESOS AI App" };
  return { title: data.name, description: data.description };
}

export default async function Index({ params }) {
  const data = await getData(params.site);
  if (!data) return <Loader />;

  console.log({ data });

  return (
    <>
      <Navigation categories={data.categories} title={data.name} />
      <div className="mb-20 w-full">
        {data.posts.length > 0 ? (
          <div className="mx-auto w-full max-w-screen-lg md:mb-28 lg:w-5/6">
            <Link
              href={`${
                data.posts[0].category?.parent?.slug
                  ? "/" + data.posts[0].category?.parent?.slug
                  : ""
              }/${data.posts[0].category?.slug}/${data.posts[0].slug}`}
            >
              <div className="group relative mx-auto h-80 w-full overflow-hidden sm:h-150 lg:rounded">
                {data.posts[0].image && (
                  <Image
                    alt={data.posts[0].title ?? ""}
                    className="h-full w-full object-cover"
                    width={1300}
                    height={630}
                    src={data.posts[0].image}
                  />
                )}
              </div>
            </Link>
            <div className="mx-auto mt-4 flex w-5/6 flex-col items-start lg:w-full">
              <Link
                href={`${
                  data.posts[0].category?.parent?.slug
                    ? "/" + data.posts[0].category?.parent?.slug
                    : ""
                }/${data.posts[0].category?.slug}`}
                className="flex w-auto items-center justify-center rounded-full border px-4 py-1"
              >
                {data.posts[0].category?.title}
              </Link>
              <Link
                href={`${
                  data.posts[0].category?.parent?.slug
                    ? "/" + data.posts[0].category?.parent?.slug
                    : ""
                }/${data.posts[0].category?.slug}/${data.posts[0].slug}`}
              >
                <h2 className="my-2 text-3xl font-bold hover:underline md:text-4xl">
                  {data.posts[0].title}
                </h2>
              </Link>
              <p className="mb-2 w-full text-base line-clamp-2">
                {data.posts[0].content?.substring(0, 350)}
              </p>
              <div className="flex w-full items-center justify-start space-x-4">
                <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full">
                  {data.user?.image && (
                    <Image
                      alt={data.user?.name ?? "User Avatar"}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                      src={data.user?.image}
                    />
                  )}
                </div>
                <p className="ml-3 inline-block whitespace-nowrap align-middle text-sm font-semibold md:text-base">
                  {data.user?.name}
                </p>
                <div className="h-6 border-l border-gray-600" />
                <p className="m-auto my-2 w-10/12 text-sm font-light text-gray-500 md:text-base">
                  {toDateString(data.posts[0].createdAt)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Image
              src="/empty-state.png"
              alt="No Posts"
              width={613}
              height={420}
            />
            <p className="mt-4 text-2xl text-gray-600">No posts yet.</p>
          </div>
        )}
      </div>
      {/* 
      {data.posts.length > 1 && (
        <div className="mx-5 mb-20 max-w-screen-lg lg:mx-24 2xl:mx-auto">
          <h2 className="mb-10 text-4xl">More stories</h2>
          <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
            {data.posts.slice(1).map((metadata, index) => (
              <BlogCard key={index} data={metadata} />
            ))}
          </div>
        </div>
      )} */}
    </>
  );
}
