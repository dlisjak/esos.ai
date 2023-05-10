import prisma from "@/lib/prisma";

export default async function handler(req: any, res: any) {
  const { currentHost } = req.query;
  console.log(currentHost);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  // Instructing the Vercel edge to cache the file
  // res.setHeader("Cache-control", "stale-while-revalidate, s-maxage=3600");

  const site = await prisma.site.findFirst({
    where: {
      OR: [
        {
          subdomain: currentHost,
        },
        {
          customDomain: currentHost,
        },
      ],
    },
  });

  console.log(site);

  if (!site || !site?.id) res.end("Sitemap not available");

  const categories = await prisma.category.findMany({
    where: {
      site: {
        id: site?.id,
      },
      parentId: null,
    },
    select: {
      slug: true,
      posts: true,
      children: {
        select: {
          slug: true,
          posts: true,
          children: {
            select: {
              slug: true,
              posts: true,
              children: {
                select: {
                  slug: true,
                  posts: true,
                  children: {
                    select: {
                      slug: true,
                      posts: true,
                      children: true,
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

  const sitemap: any = [];

  categories.forEach((category) => {
    sitemap.push(`/${category.slug}`);

    if (category.posts.length > 0) {
      category.posts.forEach((post) => {
        sitemap.push(`/${category.slug}/${post.slug}`);
      });
    }

    if (category.children.length > 0) {
      category.children.forEach((child) => {
        sitemap.push(`/${category.slug}/${child.slug}`);

        if (child.posts.length > 0) {
          child.posts.forEach((post) => {
            sitemap.push(`/${category.slug}/${child.slug}/${post.slug}`);
          });
        }

        if (child.children.length > 0) {
          child.children.forEach((subchild) => {
            sitemap.push(`/${category.slug}/${child.slug}/${subchild.slug}`);

            if (subchild.posts.length > 0) {
              subchild.posts.forEach((post) => {
                sitemap.push(
                  `/${category.slug}/${child.slug}/${subchild.slug}/${post.slug}`
                );
              });
            }

            if (subchild.children.length > 0) {
              subchild.children.forEach((subsubchild) => {
                sitemap.push(
                  `/${category.slug}/${child.slug}/${subchild.slug}/${subsubchild.slug}`
                );

                if (subsubchild.posts.length > 0) {
                  subsubchild.posts.forEach((post) => {
                    sitemap.push(
                      `/${category.slug}/${child.slug}/${subchild.slug}/${subsubchild.slug}${post.slug}`
                    );
                  });
                }

                if (subsubchild.children.length > 0) {
                  subsubchild.children.forEach((subsubsubchild) => {
                    sitemap.push(
                      `/${category.slug}/${child.slug}/${subchild.slug}/${subsubchild.slug}/${subsubsubchild.slug}`
                    );

                    if (subsubsubchild.posts.length > 0) {
                      subsubsubchild.posts.forEach((post) => {
                        sitemap.push(
                          `/${category.slug}/${child.slug}/${subchild.slug}/${subsubchild.slug}/${subsubsubchild.slug}/${post.slug}`
                        );
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  let stp = "";

  sitemap.forEach((url: string) => {
    stp += `${url.replace("/home", "")} \n`;
  });

  // stperate sitemap here
  const xml = `${stp}`;

  res.end(xml);
}
