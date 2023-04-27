import prisma from "@/lib/prisma";

export default async function handler(req: any, res: any) {
  const { subdomain } = req.query;
  console.log(subdomain);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");

  // Instructing the Vercel edge to cache the file
  res.setHeader("Cache-control", "stale-while-revalidate, s-maxage=3600");

  const site = await prisma.site.findFirst({
    where: {
      subdomain,
    },
  });

  const categories = await prisma.category.findMany({
    where: {
      site: {
        subdomain,
      },
      parentId: null,
    },
    select: {
      slug: true,
      children: {
        select: {
          slug: true,
          children: {
            select: {
              slug: true,
              children: {
                select: {
                  slug: true,
                  children: {
                    select: {
                      slug: true,
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

  console.log(categories);

  const categorySlugs = categories
    .map((category) => {
      if (category.children.length > 0) {
        return category.children.map((child) => {
          if (child.children.length > 0) {
          }

          return `https://${site?.customDomain}/en/${category.slug}/${child.slug}`;
        });
      }

      return `https://${site?.customDomain}/en/${category.slug}`;
    })
    .flat();

  console.log(categorySlugs);

  // generate sitemap here
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 
    <url>
      <loc>http://www.example.com/foo.html</loc>
      <lastmod>2021-01-01</lastmod>
    </url>
    </urlset>`;

  res.end(xml);
}
