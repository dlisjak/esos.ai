import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import PostBody from "../../../components/PostBody";
import CategoryLayout from "../../../components/CategoryLayout";

export const dynamicParams = true;

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

  const post = await prisma.post.findFirst({
    where: {
      slug,
      site: filter,
      translations: {
        some: {
          lang,
        },
      },
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
          parent: {
            select: { title: true, slug: true },
          },
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

  const postData = {
    ...post,
    title: post?.translations[0].title || post?.title,
    content: post?.translations[0].content || post?.content,
  };

  if (post) {
    return {
      post: postData,
      category: null,
    };
  }

  const category = await prisma.category.findFirst({
    where: {
      slug,
      site: filter,
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
    post: null,
    category: categoryData,
  };
};

export default async function Page({ params: { site, slug, lang } }: any) {
  const response = await getData(site, slug, lang);
  const { post, category } = response;

  if (!post && !category) return notFound();

  return (
    <>
      {post && <PostBody post={post} lang={lang} />}
      {category && (
        <div className="container mx-auto mb-20 w-full max-w-screen-xl">
          <CategoryLayout category={category} lang={lang} />
        </div>
      )}
    </>
  );
}
