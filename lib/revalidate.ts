import { HttpMethod } from "@/types";
import { Site } from "@prisma/client";

export async function revalidate(site: Site, lang: string, category: any) {
  const urlPaths = [
    `/_sites/classic/${site.subdomain}/${lang}/${
      category.parent
        ? category.parent.slug + "/" + category.slug
        : category.slug
    }`,
    `/_sites/${site.subdomain}`,
  ];

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
