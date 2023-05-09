const internalLinkRegex = /\[[^\]]+]\((\/[^)]+)\)/g;

export const replaceInternalLinks = (text: string, lang: string) => {
  let match;
  let modifiedText = text;

  while ((match = internalLinkRegex.exec(text)) !== null) {
    const originalLink = match[1];
    const newLink = `/${lang}${originalLink}`;
    modifiedText = modifiedText.replace(originalLink, newLink);
  }

  return modifiedText;
};
