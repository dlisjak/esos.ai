"server-only";

export const locales = [{ lang: "en" }, { lang: "de" }, { lang: "nl" }];

const dictionaries: any = {
  en: () => import("../dictonaries/en.json").then((module) => module.default),
  de: () => import("../dictonaries/de.json").then((module) => module.default),
  nl: () => import("../dictonaries/nl.json").then((module) => module.default),
};

export const getDictionary = async (locale: any) => dictionaries[locale]();
