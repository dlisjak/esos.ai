import Link from 'next/link';

import BlurImage from '../BlurImage';
import { StatusIndicator } from './PostCard';

export const CategoryList = ({
	categories,
	subdomain,
	addPostClick,
	isChild = false,
	isSubChild = false,
}) => {
	return (
		<ul className="flex flex-col">
			{categories.map((category) => {
				if (category?.parent?.id && !isChild) return;
				if (category?.parent?.id && !isSubChild) return;
				return (
					<CategoryCard
						category={category}
						subdomain={subdomain}
						addPostClick={addPostClick}
						key={category.id}
						isChild={isChild}
						isSubChild={isSubChild}
					/>
				);
			})}
		</ul>
	);
};

const CategoryCard = ({
	subdomain,
	category,
	addPostClick,
	isChild = false,
	isSubChild = false,
}) => {
	if (!category) return <></>;
	const { id, title, slug, image, children, posts } = category;

	const categoryPostsUrl = `/site/${subdomain}/categories/${id}/posts`;
	const categoryEditUrl = `/site/${subdomain}/categories/${id}`;

	return (
		<>
			<li
				className={`relative bg-white p-4 flex items-end rounded drop-shadow-sm ${
					isChild && !isSubChild
						? 'ml-8 mt-2'
						: isSubChild
						? 'ml-16 mt-2'
						: 'mt-4'
				}`}
			>
				<div className="w-full flex rounded overflow-hidden">
					<div className="relative h-[120px]">
						<Link href={categoryPostsUrl}>
							{image ? (
								<BlurImage
									alt={title ?? 'Unknown Thumbnail'}
									width={240}
									height={120}
									className="h-full object-cover"
									src={image}
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
								<h2 className="text-xl font-semibold mb-1">{title}</h2>
							</Link>
						</div>
						<p className="text-sm flex bg-slate-100 px-1 right-1 rounded w-auto line-clamp-1">
							/{slug}
						</p>
						<Link
							href={`/site/${subdomain}/categories/${id}/posts`}
							className="text-base mt-auto line-clamp-1 hover:underline"
						>
							Posts({posts.length})
						</Link>
					</div>
				</div>
				<div className="flex flex-col h-full items-end">
					<Link
						className="flex items-center justify-center rounded mt-2 px-1 tracking-wide text-white bg-slate-400 duration-200 hover:bg-slate-600"
						href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}/${slug}`}
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
							onClick={() => addPostClick(id)}
						>
							Add Post
						</button>
					</div>
				</div>
				<StatusIndicator published={true} className="top-2 left-2" />
			</li>
			{Array.isArray(children) && children.length > 0 && (
				<CategoryList
					categories={children}
					subdomain={subdomain}
					addPostClick={addPostClick}
					isChild={true}
					isSubChild={isChild}
				/>
			)}
		</>
	);
};

export default CategoryCard;
