import { notFound } from "next/navigation";

import Navigation from "../components/Navbar";
import Footer from "../components/Footer";

import prisma from "@/lib/prisma";

import "../../../../../styles/sites.css";

import { locales } from "../../../../dictionaries";

export async function generateStaticParams() {
  const sites = await prisma.site.findMany({});

  return locales;
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

  if (!data) return notFound();

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
