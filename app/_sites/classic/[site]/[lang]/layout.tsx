import { notFound } from "next/navigation";

import Navigation from "../components/Navbar";
import Footer from "../components/Footer";

import prisma from "@/lib/prisma";

import "../../../../../styles/sites.css";

export async function generateStaticParams() {
  const [subdomains, customDomains]: any = [];

  const subDomains = [].map((site: any) => ({
    ...site,
    domain: site.subdomain,
  }));
  const domains = [].map((site: any) => ({
    ...site,
    domain: site.customDomain,
  }));

  const langs = [...subDomains, ...domains]
    .map((site) => {
      return site.categories
        .map((category: any) => {
          return category.translations
            .map((translation: any) => {
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
}: any) {
  const { data, categories } = await getData(site, lang);

  if (!data || !categories.length) return notFound();

  return (
    <html lang={lang}>
      <body>
        <Navigation
          categories={categories}
          logo={data.image}
          site={data.name}
          lang={lang}
        />
        {children}
        <Footer site={data.name} />
      </body>
    </html>
  );
}
