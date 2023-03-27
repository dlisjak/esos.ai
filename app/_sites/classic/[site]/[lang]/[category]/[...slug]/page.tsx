import { notFound } from "next/navigation";

import PostBody from "../../../components/PostBody";
import CategoryLayout from "../../../components/CategoryLayout";

import prisma from "@/lib/prisma";

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: {
      parent: {
        isNot: null,
      },
      translations: {
        some: {
          lang: {
            gt: "",
          },
        },
      },
      posts: {
        some: {
          published: true,
          translations: {
            some: {
              lang: {
                gt: "",
              },
            },
          },
        },
      },
    },
    select: {
      slug: true,
      site: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
      parent: {
        select: {
          slug: true,
        },
      },
      posts: {
        select: {
          slug: true,
          translations: {
            select: {
              lang: true,
            },
          },
        },
      },
      translations: {
        select: {
          lang: true,
        },
      },
    },
  });

  const paths = categories
    .map((category) => {
      return category.translations
        .map((translation) => {
          return category.posts.map((post) => {
            return {
              site: category.site?.customDomain ?? category.site?.subdomain,
              lang: translation.lang.toLocaleLowerCase(),
              category: category.parent?.slug ?? category.slug,
              slug: category.parent ? [category.slug, post.slug] : [post.slug],
            };
          });
        })
        .flat();
    })
    .flat();

  return paths;
}

const getData = async (site: string, slugObj: string, lang: string) => {
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

  let slug = slugObj[1];
  if (!slug) {
    slug = slugObj[0];

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
          where: {
            translations: {
              some: {
                lang,
              },
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

    if (category) {
      const categoryData = {
        ...category,
        title: category?.translations[0].title || category?.title,
        content: category?.translations[0].content || category?.content,
        posts: category?.posts.map((post) => ({
          ...post,
          title: post?.translations[0]?.title || post.title,
          content: post?.translations[0]?.content || post.content,
        })),
      };

      return {
        post: null,
        category: categoryData,
      };
    }
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
              translations: {
                some: {
                  lang,
                },
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

  return {
    post: postData,
    category: null,
  };
};

export default async function Page({ params: { site, slug, lang } }: any) {
  const response = await getData(site, slug, lang);
  const { post, category } = response;
  console.log({ post });

  if (!post && !category) return notFound();
  if (!post?.content || !post?.content) return notFound();

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
