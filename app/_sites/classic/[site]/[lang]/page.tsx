import prisma from "@/lib/prisma";

import type { _SiteData } from "@/types";
import FeaturedPosts from "../components/FeaturedPosts";
import LatestPosts from "../components/LatestPosts";
import { getDictionary } from "app/dictionaries";
import CategoryLayout from "../components/CategoryLayout";

interface PageParams {
  site: string;
  lang: string;
}

interface PageProps {
  params: PageParams;
}

export async function generateStaticParams() {
  const [subdomains, customDomains] = await Promise.all([
    prisma.site.findMany({
      select: {
        subdomain: true,
        categories: {
          select: {
            translations: {
              select: {
                lang: true,
              },
            },
          },
        },
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
        categories: {
          select: {
            translations: {
              select: {
                lang: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const subDomains = [...subdomains].map((site) => ({
    ...site,
    domain: site.subdomain,
  }));
  const domains = [...customDomains].map((site) => ({
    ...site,
    domain: site.customDomain,
  }));

  const langs = [...subDomains, ...domains]
    .map((site) => {
      return site.categories
        .map((category) => {
          return category.translations
            .map((translation) => {
              return {
                site: site?.domain,
                lang: translation.lang.toLowerCase(),
              };
            })
            .flat();
        })
        .flat();
    })
    .flat();

  const paths = langs.filter(
    (value, index, self) =>
      index ===
      self.findIndex((t) => t.site === value.site && t.lang === value.lang)
  );

  return paths;
}

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
              parent: {
                select: {
                  slug: true,
                  parent: {
                    select: {
                      slug: true,
                      parent: {
                        select: {
                          slug: true,
                          parent: {
                            select: {
                              slug: true,
                              parent: {
                                select: {
                                  slug: true,
                                  parent: true,
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
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    take: 6,
  });

  const response = await prisma.category.findFirst({
    where: {
      slug: "home",
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
      createdAt: true,
      posts: {
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          published: true,
          createdAt: true,
          updatedAt: true,
        },
      },
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
  const breadcrumbs = [{ id: 0, title: "Home", slug: "/" }];
  const navigation = cat?.children.length
    ? cat?.children?.map((child) => ({
        id: child.id,
        title: child.title,
        href: `/${child.slug}`,
      }))
    : cat?.posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: `/${post.slug}`,
      }));
  const posts = cat?.posts.map((post) => ({
    ...post,
    slug: `/${post.slug}`,
  }));

  const content = cat?.translations[0].content || cat?.content;
  const title = cat?.translations[0].title || cat?.title;

  const headingRegex = /#{1}.+(?=\n)/g;
  const headings = content?.match(headingRegex) || [];
  const heading = headings[0] || title || "";

  const bodyText = content?.replace(heading, "");
  const categoryData = {
    ...cat,
    posts,
    breadcrumbs,
    navigation,
    content,
    bodyText,
    heading,
    title,
  };

  return {
    homepage: categoryData,
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

export default async function Index({ params: { site, lang } }: PageProps) {
  const { homepage, featuredPosts, latestPosts } = await getData(site, lang);
  const dict = await getDictionary(lang);

  return (
    <>
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        {homepage && homepage.title ? (
          <CategoryLayout category={homepage} lang={lang} dict={dict} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
}
