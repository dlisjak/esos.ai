import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import Loader from "@/components/Loader";
import PostBody from "../../../components/PostBody";
import CategoryLayout from "../../../components/CategoryLayout";

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    select: {
      title: true,
      slug: true,
      image: true,
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
      site: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
    },
  });

  const paths = posts.flatMap((post) => {
    if (post.site === null || post.site.subdomain === null || !post.category)
      return {};

    if (post.site.customDomain) {
      return {
        site: post.site.customDomain,
        category: post.category.parent?.slug || post.category.slug,
        slug: [post.category.slug, post.slug],
      };
    } else {
      return {
        site: post.site.subdomain,
        category: post.category.parent?.slug || post.category.slug,
        slug: [post.category.slug, post.slug],
      };
    }
  });

  return paths;
}

const getData = async (site: string, slugObj: string, lang: string) => {
  let slug = slugObj[1];
  if (!slug) {
    slug = slugObj[0];
  }

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
    select: {
      description: true,
      user: true,
      name: true,
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

  const post = await prisma.post.findFirst({
    where: {
      slug: slug,
    },
    select: {
      title: true,
      slug: true,
      content: true,
      image: true,
      createdAt: true,
      translations: {
        where: {
          lang,
        },
      },
      category: {
        select: {
          title: true,
          slug: true,
          posts: {
            where: {
              slug: {
                not: slug,
              },
            },
            select: {
              title: true,
              slug: true,
              image: true,
              content: true,
              createdAt: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (post) {
    return {
      data,
      post: {
        ...post,
      },
    };
  }

  const category = await prisma.category.findFirst({
    where: {
      slug: slug,
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
          createdAt: true,
          content: true,
          category: {
            select: {
              title: true,
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
  });

  return {
    data,
    category,
  };
};

export default async function Category({ params: { site, slug, lang } }: any) {
  const response = await getData(site, slug, lang);
  const { data, post, category } = response;

  if (!data) return <Loader />;

  if (!post && !category) return notFound();

  const translation =
    category?.translations[0]?.content || post?.translations[0]?.content || "";

  return (
    <>
      {post && (
        <PostBody
          post={post}
          translation={translation}
          user={data.user}
          lang={lang}
        />
      )}
      {category && (
        <div className="container mx-auto mb-20 w-full max-w-screen-xl">
          <CategoryLayout
            category={category}
            translation={translation}
            lang={lang}
            user={data.user}
          />
        </div>
      )}
    </>
  );
}
