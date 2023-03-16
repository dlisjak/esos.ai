"server-only";

const dictionaries = {
  en: () => import("../dictonaries/en.json").then((module) => module.default),
  de: () => import("../dictonaries/de.json").then((module) => module.default),
};

export const getDictionary = async (locale) => dictionaries[locale]();
