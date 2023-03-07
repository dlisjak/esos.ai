import Link from 'next/link';

import BlurImage from '../BlurImage';
import { StatusIndicator } from './PostCard';

export const CategoryList = ({
	categories,
	subdomain,
	addPostClick,
	removePostClick,
	isChild = false,
	isSubChild = false,
}) => {
	return (
		<ul className={`flex flex-col ${isChild ? 'space-y-2' : 'space-y-4'}`}>
			{categories.map((category) => {
				if (category?.parent?.id && !isChild) return;
				if (category?.parent?.id && !isSubChild) return;

				return (
					<CategoryCard
						category={category}
						subdomain={subdomain}
						addPostClick={addPostClick}
						removePostClick={removePostClick}
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
	removePostClick,
	isChild = false,
	isSubChild = false,
}) => {
	if (!category) return <></>;
	const { id, title, slug, image, children, posts } = category;

	const categoryPostsUrl = `/site/${subdomain}/categories/${id}/posts`;
	const categoryEditUrl = `/site/${subdomain}/categories/${id}`;
	const canDelete = !children?.length;

	return (
		<li className="flex flex-col space-y-2">
			<div
				className={`relative bg-white p-4 flex items-end rounded drop-shadow-sm ${
					isChild && !isSubChild ? 'ml-8' : isSubChild ? 'ml-16' : ''
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
							<Link href={categoryEditUrl} className="hover:underline">
								<h2 className="text-xl font-semibold mb-1">{title}</h2>
							</Link>
						</div>
						<p className="text-sm flex bg-slate-100 px-1 right-1 rounded w-auto line-clamp-1">
							/{slug}
						</p>
						<Link
							href={categoryPostsUrl}
							className="text-base mt-auto line-clamp-1 hover:underline"
						>
							Posts({posts.length})
						</Link>
					</div>
				</div>
				<div className="flex flex-col h-full items-end">
					<div className="flex h-full space-x-2 items-end justify-between">
						{canDelete && (
							<button
								className="flex px-3 py-1 tracking-wide rounded text-white bg-red-600 duration-200 hover:bg-red-500 whitespace-nowrap"
								onClick={() => removePostClick(id, title)}
							>
								Delete
							</button>
						)}
						<Link
							className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
							href={categoryEditUrl}
						>
							Edit
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
				<Link
					className="absolute top-4 right-4 flex items-center justify-center rounded px-1 tracking-wide text-white bg-slate-400 duration-200 hover:bg-slate-600"
					href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}/${slug}`}
					rel="noreferrer"
					target="_blank"
				>
					↗
				</Link>
				<StatusIndicator published={true} className="top-2 left-2" />
			</div>
			{Array.isArray(children) && children.length > 0 && (
				<CategoryList
					categories={children}
					subdomain={subdomain}
					addPostClick={addPostClick}
					isChild={true}
					removePostClick={removePostClick}
					isSubChild={isChild}
				/>
			)}
		</li>
	);
};

export default CategoryCard;
