import Link from 'next/link';
import BlurImage from '../BlurImage';
import { StatusIndicator } from './PostCard';

const SiteCard = ({ site }) => {
	if (!site) return <></>;

	const siteOverviewUrl = `/site/${site.subdomain}`;
	const sitePostsUrl = `/site/${site.subdomain}/posts`;
	const siteCategoriesUrl = `/site/${site.subdomain}/categories`;
	const siteThemesUrl = `/site/${site.subdomain}/themes`;
	const siteSettingssUrl = `/site/${site.subdomain}/settings`;

	const domain = site.customDomain
		? site.customDomain
		: `${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${site.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`;

	return (
		<div className="relative bg-white p-4 flex items-end rounded drop-shadow-sm">
			<div className="w-full flex rounded overflow-hidden">
				<div className="relative h-[120px]">
					<Link href={siteOverviewUrl}>
						{site.image ? (
							<BlurImage
								alt={site.title ?? 'Unknown Thumbnail'}
								width={240}
								height={120}
								className="h-full object-cover"
								src={site.image}
							/>
						) : (
							<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-3xl">
								?
							</div>
						)}
					</Link>
				</div>
				<div className="flex flex-col items-start relative px-4">
					<div className="flex items-center">
						<Link href={siteOverviewUrl} className="hover:underline">
							<h2 className="text-xl font-semibold mb-1">{site.name}</h2>
						</Link>
					</div>
					<p className="text-sm flex bg-slate-100 px-1 right-1 rounded w-auto line-clamp-1">
						{domain}
					</p>
					{!site.customDomain && (
						<Link
							href={`/site/${site.subdomain}/settings`}
							className="flex px-2 py-1 mt-auto text-sm bg-yellow-400 text-white rounded pointer hover:bg-yellow-500"
						>
							Configure domain
						</Link>
					)}
				</div>
			</div>
			<div className="flex flex-col h-full items-end">
				<Link
					className="flex items-center justify-center rounded mt-2 px-1 tracking-wide text-white bg-slate-400 duration-200 hover:bg-slate-600"
					href={domain}
					onClick={(e) => e.stopPropagation()}
					rel="noreferrer"
					target="_blank"
				>
					↗
				</Link>
				<div className="flex h-full space-x-2 items-end justify-between">
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={sitePostsUrl}
					>
						Posts
					</Link>
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={siteCategoriesUrl}
					>
						Categories
					</Link>
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={siteThemesUrl}
					>
						Themes
					</Link>
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={siteSettingssUrl}
					>
						Settings
					</Link>
				</div>
			</div>
			<StatusIndicator published={site.customDomain} className="top-2 left-2" />
		</div>
	);
};

export default SiteCard;
