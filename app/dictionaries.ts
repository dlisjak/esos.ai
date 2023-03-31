"server-only";

export interface Dict {
  latestPosts: string;
  featuredPosts: string;
  navigation: string;
}
interface Dictionary {
  en: () => Promise<Dict>;
  de: () => Promise<Dict>;
  nl: () => Promise<Dict>;
}

export const locales = [{ lang: "en" }, { lang: "de" }, { lang: "nl" }];

const dictionaries: Dictionary = {
  en: () => import("../dictonaries/en.json").then((module) => module.default),
  de: () => import("../dictonaries/de.json").then((module) => module.default),
  nl: () => import("../dictonaries/nl.json").then((module) => module.default),
};

export const getDictionary = async (locale: string) =>
  dictionaries[locale as keyof Dictionary]();
