import { notFound } from "next/navigation";

import Navigation from "../components/Navbar";
import Footer from "../components/Footer";

import prisma from "@/lib/prisma";

import "../../../../../styles/sites.css";

import { locales } from "../../../../dictionaries";

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

  // const paths = allPaths
  //   .map((path) => {
  //     return locales.map((locale) => ({
  //       site: path,
  //       lang: locale.lang,
  //     }));
  //   })
  //   .flat();

  return {
    paths: allPaths.map((path) => ({
      params: {
        site: path,
        lang: "en",
      },
    })),
    fallback: true,
  };
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
          posts: {
            some: {
              published: true,
            },
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
        },
      },
    },
  });

  return { data, categories };
};

export default async function RootLayout({
  children,
  params: { site, lang },
}: any) {
  const { data, categories } = await getData(site, lang);

  if (!data || !categories) return notFound();

  return (
    <html lang={lang}>
      <body>
        <Navigation categories={categories} site={site} lang={lang} />
        {children}
        <Footer site={site} />
      </body>
    </html>
  );
}
