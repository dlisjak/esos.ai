import prisma from "@/lib/prisma";

import Navigation from "../components/Navbar";
import Footer from "../components/Footer";

import "../../../../../styles/sites.css";

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

  return categories;
};

export default async function RootLayout({
  children,
  params: { site, lang },
}: any) {
  const categories = await getData(site, lang);

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
