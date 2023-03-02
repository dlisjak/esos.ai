import Link from 'next/link';

import BlurImage from '../BlurImage';
import { StatusIndicator } from './PostCard';

const CategoryCard = ({
	subdomain,
	category,
	addPostClick,
	isChild = false,
}) => {
	if (!category) return <></>;

	const categoryPostsUrl = `/site/${subdomain}/categories/${category.id}/posts`;
	const categoryEditUrl = `/site/${subdomain}/categories/${category.id}`;

	return (
		<div
			className={`relative bg-white p-4 flex items-end rounded drop-shadow-sm ${
				isChild ? 'ml-8 mt-4' : ''
			}`}
		>
			<div className="w-full flex rounded overflow-hidden">
				<div className="relative h-[120px]">
					<Link href={categoryPostsUrl}>
						{category.image ? (
							<BlurImage
								alt={category.title ?? 'Unknown Thumbnail'}
								width={240}
								height={120}
								className="h-full object-cover"
								src={category.image}
							/>
						) : (
							<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-3xl">
								?
							</div>
						)}
					</Link>
				</div>
				<div className="flex flex-col relative px-4">
					<div className="flex items-center">
						<Link href={categoryPostsUrl} className="hover:underline">
							<h2 className="text-xl font-semibold mb-1">{category.title}</h2>
						</Link>
					</div>
					<p className="text-sm flex bg-slate-100 px-1 right-1 rounded w-auto line-clamp-1">
						/{category.slug}
					</p>
					<Link
						href={`/site/${subdomain}/categories/${category.id}/posts`}
						className="text-base mt-auto line-clamp-1 hover:underline"
					>
						Posts({category.posts.length})
					</Link>
				</div>
			</div>
			<div className="flex flex-col h-full items-end">
				<Link
					className="flex items-center justify-center rounded mt-2 px-1 tracking-wide text-white bg-slate-400 duration-200 hover:bg-slate-600"
					href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}/${category.slug}`}
					rel="noreferrer"
					target="_blank"
				>
					↗
				</Link>
				<div className="flex h-full space-x-2 items-end justify-between">
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={categoryEditUrl}
					>
						Edit Category
					</Link>
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={categoryPostsUrl}
					>
						Edit Posts
					</Link>
					<button
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						onClick={() => addPostClick(category.id)}
					>
						Add Post
					</button>
				</div>
			</div>
			<StatusIndicator published={true} className="top-2 left-2" />
		</div>
	);
};

export default CategoryCard;
