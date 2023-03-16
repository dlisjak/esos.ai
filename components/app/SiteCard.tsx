import Image from "next/image";
import Link from "next/link";
import { StatusIndicator } from "./PostCard";

const SiteCard = ({ site }: any) => {
  if (!site) return <></>;

  const siteOverviewUrl = `/site/${site.subdomain}`;
  const sitePostsUrl = `/site/${site.subdomain}/posts`;
  const siteCategoriesUrl = `/site/${site.subdomain}/categories`;
  const siteSettingssUrl = `/site/${site.subdomain}/settings`;

  const domain = site.customDomain
    ? `https://${site.customDomain}`
    : `${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${site.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`;

  return (
    <div className="relative flex items-end rounded bg-white p-4 drop-shadow-sm">
      <div className="flex w-full overflow-hidden rounded">
        <div className="relative h-[120px]">
          <Link href={siteOverviewUrl}>
            <Image
              alt={site.image?.alt ?? ""}
              width={240}
              height={120}
              className="h-full object-cover"
              src={site.image?.src ?? "/placeholder.png"}
            />
          </Link>
        </div>
        <div className="relative flex flex-col items-start px-4">
          <div className="flex items-center">
            <Link href={siteOverviewUrl} className="hover:underline">
              <h2 className="mb-1 text-xl font-semibold">{site.name}</h2>
            </Link>
          </div>
          <p className="right-1 flex w-auto rounded bg-gray-100 px-1 text-sm line-clamp-1">
            {domain}
          </p>
          {!site.customDomain && (
            <Link
              href={`/site/${site.subdomain}/settings`}
              className="pointer mt-auto flex rounded bg-yellow-400 px-2 py-1 text-sm text-white hover:bg-yellow-500"
            >
              Configure domain
            </Link>
          )}
        </div>
      </div>
      <div className="flex h-full flex-col items-end">
        <Link
          className="flex items-center justify-center rounded bg-slate-400 px-1 tracking-wide text-white duration-200 hover:bg-slate-600"
          href={domain}
          onClick={(e) => e.stopPropagation()}
          rel="noreferrer"
          target="_blank"
        >
          ↗
        </Link>
        <div className="flex h-full items-end justify-between space-x-2">
          <Link
            className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
            href={siteOverviewUrl}
          >
            Overview
          </Link>
          <Link
            className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
            href={sitePostsUrl}
          >
            Posts
          </Link>
          <Link
            className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
            href={siteCategoriesUrl}
          >
            Categories
          </Link>
          <Link
            className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
            href={siteSettingssUrl}
          >
            Settings
          </Link>
        </div>
      </div>
      <StatusIndicator
        published={!!site.customDomain}
        className="top-2 left-2"
      />
    </div>
  );
};

export default SiteCard;
