const internalLinkRegex = /\[[^\]]+]\((\/[^)]+)\)/g;

export const replaceInternalLinks = (text: string, lang: string) => {
  const modifiedText = text.replace(internalLinkRegex, (match, url) => {
    if (url.startsWith(`/${lang}`)) {
      return match;
    }
    const newLink = `/${lang}${url}`;
    return match.replace(url, newLink);
  });

  return modifiedText;
};
