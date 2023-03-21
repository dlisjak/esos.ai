import { HttpMethod } from "@/types";
import { Category, Site } from "@prisma/client";

export async function revalidate(site: Site, lang: string, category: Category) {
  const urlPaths = [
    `/_sites/classic/${site.subdomain}/${lang}/${category.slug}`,
    `/_sites/classic/${site.subdomain}/${lang}`,
  ];

  const hostname = site.customDomain
    ? `${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${site.customDomain}`
    : `${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${process.env.NEXT_PUBLIC_DOMAIN_URL}`;

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
