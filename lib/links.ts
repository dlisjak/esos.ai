const extractBrokenPart = (url: string) => {
  const remove404Regex = /(?<=\/\/[^\/]+\/)(.*)/;

  const match = url.match(remove404Regex);
  return match && match[1];
};

export const removeBrokenLinks = (message: string, brokenLink: string[]) => {
  return brokenLink.reduce(
    (acc, link) => acc.replace(new RegExp(link, "g"), ""),
    message
  );
};

export const extractBrokenLinks = async (message: string) => {
  const markdownRegex =
    /\[.*?\]\((https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,6}(?:\/[^/\s\)]*)*)\)/g;
  const plainRegex = /https?:\/\/[\w\-+_.!#~\/\[\]]+/gi;
  const markdownLinks = [...message.matchAll(markdownRegex)].map(
    (match) => match[1]
  );
  const plainLinks = message.match(plainRegex) || [];

  const links = [...markdownLinks, ...plainLinks];

  const promises: any = [];

  links.forEach((link: string) => {
    promises.push(
      fetch(link, { mode: "no-cors" })
        .then((res) => {
          if (res.status === 404) {
            const brokenLink = extractBrokenPart(link);
            if (brokenLink) {
              return brokenLink;
            }
          }
        })
        .catch((err) => {
          const brokenLink = extractBrokenPart(link);
          if (brokenLink) {
            return brokenLink;
          }
        })
    );
  });

  const brokenLinks = await Promise.all(promises).then((result) => {
    return result;
  });

  console.log({ brokenLinks });

  return brokenLinks;
};
