import { notFound } from "next/navigation";

import Navigation from "../components/Navbar";
import Footer from "../components/Footer";

import prisma from "@/lib/prisma";

import "../../../../../styles/sites.css";

interface PageParams {
  site: string;
  lang: string;
}

interface PageProps {
  children: any;
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

  const data = await prisma.site.findFirst({
    where: filter,
    select: {
      name: true,
      image: true,
      customCss: true,
      customJs: true,
    },
  });

  const categories = await prisma.category.findMany({
    where: {
      site: filter,
      parentId: null,
      translations: {
        some: {
          lang,
        },
      },
    },
    select: {
      title: true,
      slug: true,
      children: {
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
        },
      },
    },
  });

  return { data, categories };
};

export default async function RootLayout({
  children,
  params: { site, lang },
}: PageProps) {
  const { data, categories } = await getData(site, lang);

  if (!data || !categories.length) return notFound();

  return (
    <html lang={lang}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: data.customCss || "" }} />
      </head>
      <body>
        <Navigation
          categories={categories}
          logo={data.image}
          site={data.name ?? ""}
          lang={lang}
        />
        <div className="px-4">{children}</div>
        <Footer site={data.name} />
        <script dangerouslySetInnerHTML={{ __html: data.customJs || "" }} />
      </body>
    </html>
  );
}
