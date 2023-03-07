import Link from 'next/link';
import BlurImage from '../BlurImage';

export const StatusIndicator = ({
	published,
	right = false,
	className = '',
}) => {
	return (
		<div
			className={`${className} absolute top-2 ${
				!right ? 'left-2' : 'right-2'
			} w-4 h-4 rounded-full ${published ? 'bg-emerald-400' : 'bg-yellow-400'}`}
		/>
	);
};

const PostCard = ({ subdomain, post, postEditUrl, removePostClick }) => {
	if (!post || !postEditUrl) return <></>;
	const { id, image, title, slug, category, published } = post;

	return (
		<div className="relative bg-white p-4 flex items-end rounded drop-shadow-sm">
			<div className="w-full flex overflow-hidden">
				<div className="relative h-[120px]">
					<Link href={postEditUrl}>
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
						<Link href={postEditUrl} className="hover:underline">
							<h2 className="text-xl font-semibold mb-1">{title}</h2>
						</Link>
					</div>
					<p className="text-sm flex bg-slate-100 px-1 right-1 rounded w-auto line-clamp-1">
						/{slug}
					</p>
					<Link
						href={`/site/${subdomain}/categories/${category?.id}`}
						className="hover:underline"
					>
						<p>{category?.title}</p>
					</Link>
				</div>
			</div>
			<div className="flex flex-col h-full items-end">
				<Link
					className="flex items-center justify-center rounded px-1 tracking-wide text-white bg-slate-400 duration-200 hover:bg-slate-600"
					href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${subdomain}.${
						process.env.NEXT_PUBLIC_DOMAIN_URL
					}${category?.slug ? '/' + category?.slug : ''}/${slug}`}
					onClick={(e) => e.stopPropagation()}
					rel="noreferrer"
					target="_blank"
				>
					↗
				</Link>
				<div className="flex h-full space-x-2 items-end justify-between">
					<button
						className="flex px-3 py-1 tracking-wide rounded text-white bg-red-600 duration-200 hover:bg-red-500 whitespace-nowrap"
						onClick={() => removePostClick(id, title)}
					>
						Delete
					</button>
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={postEditUrl}
					>
						Edit
					</Link>
				</div>
			</div>
			<StatusIndicator published={published} className="top-2 left-2" />
		</div>
	);
};

export default PostCard;
