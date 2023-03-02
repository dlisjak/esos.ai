import Link from 'next/link';

import BlurImage from '../BlurImage';

const CategoryCard = ({
	subdomain,
	category,
	addPostClick,
	isChild = false,
}) => {
	if (!category) return <></>;

	const categoryEditUrl = `/site/${subdomain}/categories/${category.id}`;

	return (
		<div
			className={`flex items-end pb-2 border-b border-gray-200 ${
				isChild ? 'ml-8 mt-4' : ''
			}`}
		>
			<div className="w-full flex rounded overflow-hidden mb-2">
				<div className="relative h-[120px]">
					<Link href={categoryEditUrl}>
						{category.image ? (
							<BlurImage
								alt={category.title ?? 'Unknown Thumbnail'}
								width={240}
								height={120}
								className="h-full object-cover"
								src={category.image}
							/>
						) : (
							<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl">
								?
							</div>
						)}
					</Link>
				</div>
				<div className="flex flex-col relative p-4">
					<Link href={categoryEditUrl} className="hover:underline">
						<h2 className="text-2xl border-black mb-2">{category.title}</h2>
					</Link>
					<p className="text-base line-clamp-1">/{category.slug}</p>
					<p className="text-base line-clamp-3">{category.description}</p>
				</div>
				<div className="flex flex-col justify-center relative w-auto p-4">
					<Link
						href={`/site/${subdomain}/categories/${category.id}/posts`}
						className="text-base mt-auto line-clamp-1 hover:underline"
					>
						Posts: {category.posts.length}
					</Link>
				</div>
			</div>
			<div className="flex flex-col items-end">
				<button
					className="flex mt-auto px-3 py-1 mb-2 tracking-wide rounded text-white bg-black whitespace-nowrap"
					onClick={() => addPostClick(category.id)}
				>
					Add Post
				</button>
				<Link
					className="flex mt-auto px-3 py-1 mb-2 tracking-wide rounded text-white bg-black whitespace-nowrap"
					href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}/${category.slug}`}
					rel="noreferrer"
					target="_blank"
				>
					View ↗
				</Link>
			</div>
		</div>
	);
};

export default CategoryCard;
