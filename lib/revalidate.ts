import { HttpMethod } from "@/types";
import { Site } from "@prisma/client";

export async function revalidate(
  site: Site,
  lang: string = "en",
  category: any,
  post: any = null
) {
  const urlPaths = [`/_sites/classic/${site.subdomain}/${lang}`];

  if (post) {
    if (category) {
      urlPaths.push(
        `/_sites/classic/${site.subdomain}/${lang}/${
          category.slug + "/" + post.slug
        }`
      );
      if (category.parent) {
        urlPaths.push(
          `/_sites/classic/${site.subdomain}/${lang}/${
            category.parent.slug + "/" + category.slug + "/" + post.slug
          }`
        );
      }
    }
  }

  if (category) {
    urlPaths.push(`/_sites/classic/${site.subdomain}/${lang}/${category.slug}`);

    if (category.parent) {
      urlPaths.push(
        `/_sites/classic/${site.subdomain}/${lang}/${
          category.parent.slug + "/" + category.slug
        }`
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
