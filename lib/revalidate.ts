import { HttpMethod } from "@/types";
import { Site } from "@prisma/client";

export async function revalidate(
  site: Partial<Site>,
  lang: string = "en",
  category: any,
  post: any = null
) {
  const urlPaths = [
    `/_sites/classic/${site.subdomain}/${lang}`,
    `/_sites/classic/${site.customDomain}/${lang}`,
  ];

  if (post) {
    if (category) {
      urlPaths.push(
        `/_sites/classic/${site.subdomain}/${lang}/${
          category.slug + "/" + post.slug
        }`
      );
      urlPaths.push(
        `/_sites/classic/${site.customDomain}/${lang}/${
          category.slug + "/" + post.slug
        }`
      );
      if (category.parent) {
        urlPaths.push(
          `/_sites/classic/${site.subdomain}/${lang}/${
            category.parent.slug + "/" + category.slug + "/" + post.slug
          }`
        );
        urlPaths.push(
          `/_sites/classic/${site.customDomain}/${lang}/${
            category.parent.slug + "/" + category.slug + "/" + post.slug
          }`
        );
      }
    }
  }

  if (category) {
    urlPaths.push(`/_sites/classic/${site.subdomain}/${lang}/${category.slug}`);
    urlPaths.push(
      `/_sites/classic/${site.customDomain}/${lang}/${category.slug}`
    );

    if (category.parent) {
      urlPaths.push(
        `/_sites/classic/${site.subdomain}/${lang}/${
          category.parent.slug + "/" + category.slug
        }`
      );
      urlPaths.push(
        `/_sites/classic/${site.subdomain}/${lang}/${category.parent.slug}`
      );
      urlPaths.push(
        `/_sites/classic/${site.customDomain}/${lang}/${
          category.parent.slug + "/" + category.slug
        }`
      );
      urlPaths.push(
        `/_sites/classic/${site.customDomain}/${lang}/${category.parent.slug}`
      );

      if (category.parent.parent) {
        urlPaths.push(
          `/_sites/classic/${site.subdomain}/${lang}/${
            category.parent.parent.slug +
            category.parent.slug +
            "/" +
            category.slug
          }`
        );
        urlPaths.push(
          `/_sites/classic/${site.subdomain}/${lang}/${
            category.parent.parent.slug + category.parent.slug
          }`
        );
        urlPaths.push(
          `/_sites/classic/${site.customDomain}/${lang}/${
            category.parent.parent.slug +
            category.parent.slug +
            "/" +
            category.slug
          }`
        );
        urlPaths.push(
          `/_sites/classic/${site.customDomain}/${lang}/${
            category.parent.parent.slug + category.parent.slug
          }`
        );

        if (category.parent.parent.parent) {
          urlPaths.push(
            `/_sites/classic/${site.subdomain}/${lang}/${
              category.parent.parent.parent.slug +
              category.parent.parent.slug +
              category.parent.slug +
              "/" +
              category.slug
            }`
          );
          urlPaths.push(
            `/_sites/classic/${site.subdomain}/${lang}/${
              category.parent.parent.parent.slug +
              category.parent.parent.slug +
              category.parent.slug
            }`
          );
          urlPaths.push(
            `/_sites/classic/${site.customDomain}/${lang}/${
              category.parent.parent.parent.slug +
              category.parent.parent.slug +
              category.parent.slug +
              "/" +
              category.slug
            }`
          );
          urlPaths.push(
            `/_sites/classic/${site.customDomain}/${lang}/${
              category.parent.parent.parent.slug +
              category.parent.parent.slug +
              category.parent.slug
            }`
          );

          if (category.parent.parent.parent.parent) {
            urlPaths.push(
              `/_sites/classic/${site.subdomain}/${lang}/${
                category.parent.parent.parent.parent.slug +
                category.parent.parent.parent.slug +
                category.parent.parent.slug +
                category.parent.slug +
                "/" +
                category.slug
              }`
            );
            urlPaths.push(
              `/_sites/classic/${site.subdomain}/${lang}/${
                category.parent.parent.parent.parent.slug +
                category.parent.parent.parent.slug +
                category.parent.parent.slug +
                category.parent.slug
              }`
            );
            urlPaths.push(
              `/_sites/classic/${site.customDomain}/${lang}/${
                category.parent.parent.parent.parent.slug +
                category.parent.parent.parent.slug +
                category.parent.parent.slug +
                category.parent.slug +
                "/" +
                category.slug
              }`
            );
            urlPaths.push(
              `/_sites/classic/${site.customDomain}/${lang}/${
                category.parent.parent.parent.parent.slug +
                category.parent.parent.parent.slug +
                category.parent.parent.slug +
                category.parent.slug
              }`
            );
          }
        }
      }
    }
  }

  console.log(urlPaths);

  const hostname = site.customDomain
    ? `${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${site.customDomain}`
    : `${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${site.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`;

  // refer to https://solutions-on-demand-isr.vercel.app/ for more info on bulk/batch revalidate
  try {
    await Promise.all(
      urlPaths.map((urlPath) =>
        fetch(`${hostname}/api/revalidate`, {
          method: HttpMethod.POST,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            urlPath,
          }),
        })
      )
    );
  } catch (err) {
    console.error(err);
  }
}
