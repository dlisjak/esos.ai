import prisma from "@/lib/prisma";

import Navigation from "../components/Navbar";
import Footer from "../components/Footer";

import "../../../../../styles/sites.css";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "de" }, { lang: "nl" }];
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
