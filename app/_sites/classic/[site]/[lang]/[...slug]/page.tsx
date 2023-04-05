import { notFound } from "next/navigation";

import PostBody from "../../components/PostBody";
import CategoryLayout from "../../components/CategoryLayout";

import prisma from "@/lib/prisma";
import { getDictionary } from "app/dictionaries";

interface PageParams {
  site: string;
  slug: string;
  lang: string;
}

interface PageProps {
  params: PageParams;
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: {
      parent: {
        is: null,
      },
      translations: {
        some: {
          lang: {
            gt: "",
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
      children: {
        select: {
          slug: true,
          children: {
            select: {
              slug: true,
              translations: true,
              children: {
                select: {
                  slug: true,
                  translations: true,
                  children: {
                    select: {
                      slug: true,
                      translations: true,
                      children: {
                        select: {
                          slug: true,
                          translations: true,
                        },
                      },
                    },
                  },
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
          if (category.children.length > 0) {
            return category.children
              .map((child) => {
                if (child.children.length > 0) {
                  return child.children
                    .map((subchild) => {
                      if (subchild.children) {
                        return subchild.children
                          .map((subsubchild) => {
                            if (subsubchild.children.length > 0) {
                              return subsubchild.children
                                .map((subsubsubchild) => ({
                                  site:
                                    category.site?.customDomain ??
                                    category.site?.subdomain,
                                  lang: translation.lang.toLowerCase(),
                                  slug: [
                                    category.slug,
                                    child.slug,
                                    subchild.slug,
                                    subsubchild.slug,
                                    subsubsubchild.slug,
                                  ],
                                }))
                                .flat();
                            }

                            return {
                              site:
                                category.site?.customDomain ??
                                category.site?.subdomain,
                              lang: translation.lang.toLowerCase(),
                              slug: [
                                category.slug,
                                child.slug,
                                subchild.slug,
                                subsubchild.slug,
                              ],
                            };
                          })
                          .flat();
                      }

                      return {
                        site:
                          category.site?.customDomain ??
                          category.site?.subdomain,
                        lang: translation.lang.toLowerCase(),
                        slug: [category.slug, child.slug, subchild.slug],
                      };
                    })
                    .flat();
                }

                return {
                  site: category.site?.customDomain ?? category.site?.subdomain,
                  lang: translation.lang.toLowerCase(),
                  slug: [category.slug, child.slug],
                };
              })
              .flat();
          }

          return {
            site: category.site?.customDomain ?? category.site?.subdomain,
            lang: translation.lang.toLowerCase(),
            slug: [category.slug],
          };
        })
        .flat();
    })
    .flat();

  return paths;
}

const getPost = async (slug: string, lang: string, filter: any) => {
  return await prisma.post.findFirst({
    where: {
      slug: slug,
      site: filter,
      translations: {
        some: {
          lang,
        },
      },
    },
    select: {
      id: true,
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
          id: true,
          title: true,
          slug: true,
          parent: {
            select: {
              id: true,
              title: true,
              slug: true,
              parent: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  parent: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                      parent: {
                        select: {
                          id: true,
                          title: true,
                          slug: true,
                          parent: {
                            select: {
                              id: true,
                              title: true,
                              slug: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
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
};

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

  let post = null;
  let category = null;
  const mainCategorySlug = slugObj[0];

  if (slugObj[5]) {
    post = await getPost(slugObj[5], lang, filter);
  }

  if (post) {
    const breadcrumbs = [
      { id: 0, title: "Home", slug: "/" },
      {
        id: post?.category?.parent?.parent?.parent?.parent?.id,
        title: post?.category?.parent?.parent?.parent?.parent?.title,
        slug: `/${post?.category?.parent?.parent?.parent?.parent?.slug}`,
      },
      {
        id: post?.category?.parent?.parent?.parent?.id,
        title: post?.category?.parent?.parent?.parent?.title,
        slug: `/${post?.category?.parent?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.parent?.slug}`,
      },
      {
        id: post?.category?.parent?.parent?.id,
        title: post?.category?.parent?.parent?.title,
        slug: `/${post?.category?.parent?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.slug}`,
      },
      {
        id: post?.category?.parent?.id,
        title: post?.category?.parent?.title,
        slug: `/${post?.category?.parent?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}`,
      },
      {
        id: post?.category?.id,
        title: post?.category?.title,
        slug: `/${post?.category?.parent?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}/${post?.category?.slug}`,
      },
      {
        id: post?.id,
        title: post?.title,
        slug: `/${post?.category?.parent?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}/${post?.category?.slug}/${post?.slug}`,
      },
    ];

    const postData = {
      ...post,
      breadcrumbs,
      title: post?.translations[0].title || post?.title,
      content: post?.translations[0].content || post?.content,
    };

    return {
      category,
      post: postData,
    };
  }

  if (slugObj[4]) {
    post = await getPost(slugObj[4], lang, filter);

    if (post) {
      const breadcrumbs = [
        { id: 0, title: "Home", slug: "/" },
        {
          id: post?.category?.parent?.parent?.parent?.id,
          title: post?.category?.parent?.parent?.parent?.title,
          slug: `/${post?.category?.parent?.parent?.parent?.slug}`,
        },
        {
          id: post?.category?.parent?.parent?.id,
          title: post?.category?.parent?.parent?.title,
          slug: `/${post?.category?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.slug}`,
        },
        {
          id: post?.category?.parent?.id,
          title: post?.category?.parent?.title,
          slug: `/${post?.category?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}`,
        },
        {
          id: post?.category?.id,
          title: post?.category?.title,
          slug: `/${post?.category?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}/${post?.category?.slug}`,
        },
        {
          id: post?.id,
          title: post?.title,
          slug: `/${post?.category?.parent?.parent?.parent?.slug}/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}/${post?.category?.slug}/${post?.slug}`,
        },
      ];

      const postData = {
        ...post,
        breadcrumbs,
        title: post?.translations[0].title || post?.title,
        content: post?.translations[0].content || post?.content,
      };

      return {
        category,
        post: postData,
      };
    }

    const response = await prisma.category.findFirst({
      where: {
        slug: mainCategorySlug,
        site: filter,
        translations: {
          some: {
            lang,
          },
        },
      },
      select: {
        children: {
          where: {
            slug: slugObj[1],
          },
          select: {
            children: {
              where: {
                slug: slugObj[2],
              },
              select: {
                children: {
                  where: {
                    slug: slugObj[3],
                  },
                  select: {
                    children: {
                      where: {
                        slug: slugObj[4],
                      },
                      select: {
                        id: true,
                        slug: true,
                        title: true,
                        content: true,
                        posts: true,
                        image: true,
                        translations: { where: { lang } },
                        children: {
                          select: {
                            id: true,
                            slug: true,
                            title: true,
                            image: true,
                          },
                        },
                        parent: {
                          select: {
                            id: true,
                            title: true,
                            slug: true,
                            children: {
                              select: {
                                id: true,
                                title: true,
                                slug: true,
                              },
                            },
                            parent: {
                              select: {
                                id: true,
                                title: true,
                                slug: true,
                                parent: {
                                  select: {
                                    id: true,
                                    title: true,
                                    slug: true,
                                    parent: {
                                      select: {
                                        id: true,
                                        title: true,
                                        slug: true,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const cat = response?.children[0].children[0].children[0].children[0];

    const breadcrumbs = [
      { id: 0, title: "Home", slug: "/" },
      {
        id: cat?.parent?.parent?.parent?.parent?.id,
        title: cat?.parent?.parent?.parent?.parent?.title,
        slug: `/${cat?.parent?.parent?.parent?.parent?.slug}`,
      },
      {
        id: cat?.parent?.parent?.parent?.id,
        title: cat?.parent?.parent?.parent?.title,
        slug: `/${cat?.parent?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.parent?.slug}`,
      },
      {
        id: cat?.parent?.parent?.id,
        title: cat?.parent?.parent?.title,
        slug: `/${cat?.parent?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}`,
      },
      {
        id: cat?.parent?.id,
        title: cat?.parent?.title,
        slug: `/${cat?.parent?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/`,
      },
      {
        id: cat?.id,
        title: cat?.title,
        slug: `/${cat?.parent?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${cat?.slug}`,
      },
    ];
    const navigation = cat?.parent?.children?.map((child) => ({
      id: child.id,
      title: child.title,
      href: `/${cat?.parent?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${child.slug}`,
    }));
    const posts = cat?.posts.map((post) => ({
      ...post,
      slug: `/${cat?.parent?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${cat.slug}/${post.slug}`,
    }));

    if (cat) {
      const categoryData = {
        ...cat,
        posts,
        breadcrumbs,
        navigation,
        title: cat?.translations[0].title || cat?.title,
        content: cat?.translations[0].content || cat?.content,
      };

      return {
        post: null,
        category: categoryData,
      };
    }
  } else if (slugObj[3]) {
    post = await getPost(slugObj[3], lang, filter);

    if (post) {
      const breadcrumbs = [
        { id: 0, title: "Home", slug: "/" },
        {
          id: post?.category?.parent?.parent?.id,
          title: post?.category?.parent?.parent?.title,
          slug: `/${post?.category?.parent?.parent?.slug}`,
        },
        {
          id: post?.category?.parent?.id,
          title: post?.category?.parent?.title,
          slug: `/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}`,
        },
        {
          id: post?.category?.id,
          title: post?.category?.title,
          slug: `/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}/${post?.category?.slug}`,
        },
        {
          id: post?.id,
          title: post?.title,
          slug: `/${post?.category?.parent?.parent?.slug}/${post?.category?.parent?.slug}/${post?.category?.slug}/${post?.slug}`,
        },
      ];

      const postData = {
        ...post,
        breadcrumbs,
        title: post?.translations[0].title || post?.title,
        content: post?.translations[0].content || post?.content,
      };

      return {
        category,
        post: postData,
      };
    }

    const response = await prisma.category.findFirst({
      where: {
        slug: mainCategorySlug,
        site: filter,
        translations: {
          some: {
            lang,
          },
        },
      },
      select: {
        children: {
          where: {
            slug: slugObj[1],
          },
          select: {
            children: {
              where: {
                slug: slugObj[2],
              },
              select: {
                children: {
                  where: {
                    slug: slugObj[3],
                  },
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    content: true,
                    posts: true,
                    image: true,
                    translations: { where: { lang } },
                    children: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        image: true,
                      },
                    },
                    parent: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        parent: {
                          select: {
                            id: true,
                            title: true,
                            slug: true,
                            parent: {
                              select: {
                                id: true,
                                title: true,
                                slug: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const cat = response?.children[0].children[0].children[0];

    const breadcrumbs = [
      { id: 0, title: "Home", slug: "/" },
      {
        id: cat?.parent?.parent?.parent?.id,
        title: cat?.parent?.parent?.parent?.title,
        slug: `/${cat?.parent?.parent?.parent?.slug}`,
      },
      {
        id: cat?.parent?.parent?.id,
        title: cat?.parent?.parent?.title,
        slug: `/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}`,
      },
      {
        id: cat?.parent?.id,
        title: cat?.parent?.title,
        slug: `/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/`,
      },
      {
        id: cat?.id,
        title: cat?.title,
        slug: `/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${cat?.slug}`,
      },
    ];
    const navigation = cat?.children?.map((child) => ({
      id: child.id,
      title: child.title,
      href: `/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${cat.slug}/${child.slug}`,
    }));
    const posts = cat?.posts.map((post) => ({
      ...post,
      slug: `/${cat?.parent?.parent?.parent?.slug}/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${cat.slug}/${post.slug}`,
    }));

    if (cat) {
      const categoryData = {
        ...cat,
        posts,
        breadcrumbs,
        navigation,
        title: cat?.translations[0].title || cat?.title,
        content: cat?.translations[0].content || cat?.content,
      };

      return {
        post: null,
        category: categoryData,
      };
    }
  } else if (slugObj[2]) {
    post = await getPost(slugObj[2], lang, filter);

    if (post) {
      const breadcrumbs = [
        { id: 0, title: "Home", slug: "/" },
        {
          id: post?.category?.parent?.id,
          title: post?.category?.parent?.title,
          slug: `/${post?.category?.parent?.slug}`,
        },
        {
          id: post?.category?.id,
          title: post?.category?.title,
          slug: `/${post?.category?.parent?.slug}/${post?.category?.slug}`,
        },
        {
          id: post?.id,
          title: post?.title,
          slug: `/${post?.category?.parent?.slug}/${post?.category?.slug}/${post?.slug}`,
        },
      ];

      const postData = {
        ...post,
        breadcrumbs,
        title: post?.translations[0].title || post?.title,
        content: post?.translations[0].content || post?.content,
      };

      return {
        category,
        post: postData,
      };
    }

    const response = await prisma.category.findFirst({
      where: {
        slug: mainCategorySlug,
        site: filter,
        translations: {
          some: {
            lang,
          },
        },
      },
      select: {
        children: {
          where: {
            slug: slugObj[1],
          },
          select: {
            children: {
              where: {
                slug: slugObj[2],
              },
              select: {
                id: true,
                slug: true,
                title: true,
                content: true,
                posts: true,
                image: true,
                translations: { where: { lang } },
                children: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    image: true,
                  },
                },
                parent: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    parent: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const cat = response?.children[0].children[0];

    const breadcrumbs = [
      { id: 0, title: "Home", slug: "/" },
      {
        id: cat?.parent?.parent?.id,
        title: cat?.parent?.parent?.title,
        slug: `/${cat?.parent?.parent?.slug}`,
      },
      {
        id: cat?.parent?.id,
        title: cat?.parent?.title,
        slug: `/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/`,
      },
      {
        id: cat?.id,
        title: cat?.title,
        slug: `/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${cat?.slug}`,
      },
    ];
    const navigation = cat?.children?.map((child) => ({
      id: child.id,
      title: child.title,
      href: `/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${cat.slug}/${child.slug}`,
    }));
    const posts = cat?.posts.map((post) => ({
      ...post,
      slug: `/${cat?.parent?.parent?.slug}/${cat?.parent?.slug}/${cat.slug}/${post.slug}`,
    }));

    if (cat) {
      const categoryData = {
        ...cat,
        posts,
        breadcrumbs,
        navigation,
        title: cat?.translations[0].title || cat?.title,
        content: cat?.translations[0].content || cat?.content,
      };

      return {
        post: null,
        category: categoryData,
      };
    }
  } else if (slugObj[1]) {
    post = await getPost(slugObj[1], lang, filter);

    if (post) {
      const breadcrumbs = [
        { id: 0, title: "Home", slug: "/" },
        {
          id: post?.category?.id,
          title: post?.category?.title,
          slug: `/${post?.category?.slug}`,
        },
        {
          id: post?.id,
          title: post?.title,
          slug: `/${post?.category?.slug}/${post?.slug}`,
        },
      ];

      const postData = {
        ...post,
        breadcrumbs,
        title: post?.translations[0].title || post?.title,
        content: post?.translations[0].content || post?.content,
      };

      return {
        category,
        post: postData,
      };
    }

    const response = await prisma.category.findFirst({
      where: {
        slug: mainCategorySlug,
        site: filter,
        translations: {
          some: {
            lang,
          },
        },
      },
      select: {
        children: {
          where: {
            slug: slugObj[1],
          },
          select: {
            id: true,
            slug: true,
            title: true,
            content: true,
            posts: true,
            image: true,
            translations: { where: { lang } },
            parent: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
            children: {
              select: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const cat = response?.children[0];

    const breadcrumbs = [
      { id: 0, title: "Home", slug: "/" },
      {
        id: cat?.parent?.id,
        title: cat?.parent?.title,
        slug: `/${cat?.parent?.slug}`,
      },
      {
        id: cat?.id,
        title: cat?.title,
        slug: `/${cat?.parent?.slug}/${cat?.slug}`,
      },
    ];
    const navigation = cat?.children?.map((child) => ({
      id: child.id,
      title: child.title,
      href: `/${cat?.parent?.slug}/${cat.slug}/${child.slug}`,
    }));
    const posts = cat?.posts.map((post) => ({
      ...post,
      slug: `/${cat?.parent?.slug}/${cat.slug}/${post.slug}`,
    }));

    if (cat) {
      const categoryData = {
        ...cat,
        posts,
        breadcrumbs,
        navigation,
        title: cat?.translations[0].title || cat?.title,
        content: cat?.translations[0].content || cat?.content,
      };

      return {
        post: null,
        category: categoryData,
      };
    }
  } else if (slugObj[0]) {
    post = await getPost(slugObj[0], lang, filter);

    if (post) {
      const breadcrumbs = [
        { id: 0, title: "Home", slug: "/" },
        {
          id: post?.id,
          title: post?.title,
          slug: `/${post.slug}`,
        },
      ];

      const postData = {
        ...post,
        breadcrumbs,
        title: post?.translations[0].title || post?.title,
        content: post?.translations[0].content || post?.content,
      };

      return {
        category,
        post: postData,
      };
    }

    const response = await prisma.category.findFirst({
      where: {
        slug: mainCategorySlug,
        site: filter,
        translations: {
          some: {
            lang,
          },
        },
      },
      select: {
        slug: true,
        title: true,
        content: true,
        posts: true,
        image: true,
        translations: { where: { lang } },
        children: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
          },
        },
      },
    });

    const cat = response;
    const breadcrumbs = [
      { id: 0, title: "Home", slug: "/" },
      { id: 0, title: cat?.title, slug: `/${cat?.slug}` },
    ];
    const navigation = cat?.children?.map((child) => ({
      id: child.id,
      title: child.title,
      href: `/${cat.slug}/${child.slug}`,
    }));
    const posts = cat?.posts.map((post) => ({
      ...post,
      slug: `/${cat.slug}/${post.slug}`,
    }));

    if (cat) {
      const categoryData = {
        ...cat,
        posts,
        breadcrumbs,
        navigation,
        title: cat?.translations[0].title || cat?.title,
        content: cat?.translations[0].content || cat?.content,
      };

      return {
        post: null,
        category: categoryData,
      };
    }
  }

  return {
    post: null,
    category: null,
  };
};

export default async function Page({
  params: { site, slug, lang },
}: PageProps) {
  const { post, category } = await getData(site, slug, lang);
  const dict = await getDictionary(lang);

  if (!post && !category) return notFound();

  return (
    <div className="container mx-auto mb-20 w-full max-w-screen-xl">
      {post && <PostBody post={post} lang={lang} />}
      {category && (
        <CategoryLayout category={category} lang={lang} dict={dict} />
      )}
    </div>
  );
}
