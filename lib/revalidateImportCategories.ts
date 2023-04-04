import { HttpMethod } from "@/types";
import { Site } from "@prisma/client";

export async function revalidateMainCategories(
  site: Site,
  lang: string = "en",
  category: any
) {
  const urlPaths = [`/_sites/classic/${site.subdomain}/${lang}`];

  if (category) {
    urlPaths.push(`/_sites/classic/${site.subdomain}/${lang}/${category.slug}`);

    if (category.children) {
      category.children.forEach((child: any) => {
        urlPaths.push(
          `/_sites/classic/${site.subdomain}/${lang}/${category.slug}/${child.slug}`
        );

        if (child.children) {
          child.children.forEach((subChild: any) => {
            urlPaths.push(
              `/_sites/classic/${site.subdomain}/${lang}/${category.slug}/${child.slug}/${subChild.slug}`
            );

            if (subChild.children) {
              subChild.children.forEach((subSubChild: any) => {
                urlPaths.push(
                  `/_sites/classic/${site.subdomain}/${lang}/${category.slug}/${child.slug}/${subChild.slug}/${subSubChild.slug}`
                );

                if (subSubChild.children) {
                  subSubChild.children.forEach((subSubSubChild: any) => {
                    urlPaths.push(
                      `/_sites/classic/${site.subdomain}/${lang}/${category.slug}/${child.slug}/${subChild.slug}/${subSubChild.slug}/${subSubSubChild.slug}`
                    );

                    if (subSubSubChild.children) {
                      subSubSubChild.children.forEach(
                        (subSubSubSubChild: any) => {
                          urlPaths.push(
                            `/_sites/classic/${site.subdomain}/${lang}/${category.slug}/${child.slug}/${subChild.slug}/${subSubChild.slug}/${subSubSubChild.slug}/${subSubSubSubChild.slug}`
                          );
                        }
                      );
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

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
