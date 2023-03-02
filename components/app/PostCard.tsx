import Link from 'next/link';
import BlurImage from '../BlurImage';

export const StatusIndicator = ({ published, className = '' }) => {
	return (
		<div
			className={`absolute top-0 w-4 h-4 rounded-full ${
				published ? 'bg-emerald-400' : 'bg-yellow-400'
			} ${className}`}
		/>
	);
};

const PostCard = ({ subdomain, post }) => {
	if (!post) return <></>;

	const postEditUrl = `/site/${subdomain}/${
		post.category?.id ? 'categories/' + post.category.id + '/' : ''
	}posts/${post.id}`;

	return (
		<div className="flex relative items-end pb-2 border-b border-gray-200">
			<div className="w-full flex rounded overflow-hidden mb-2">
				<div className="relative h-[120px]">
					<Link href={postEditUrl}>
						{post.image ? (
							<BlurImage
								alt={post.title ?? 'Unknown Thumbnail'}
								width={240}
								height={120}
								className="h-full object-cover"
								src={post.image}
							/>
						) : (
							<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl">
								?
							</div>
						)}
					</Link>
				</div>
				<div className="flex flex-col relative p-4">
					<Link href={postEditUrl} className="hover:underline">
						<h2 className="text-2xl border-black mb-2">{post.title}</h2>
					</Link>
					<Link
						href={`/site/${subdomain}/categories/${post.category?.id}`}
						className="hover:underline"
					>
						<h3>{post.category?.title}</h3>
					</Link>
					<p>/{post.slug}</p>
				</div>
			</div>
			<div className="flex flex-col items-end">
				<Link
					className="flex mt-auto px-3 py-1 mb-2 tracking-wide rounded text-white bg-black whitespace-nowrap"
					href={postEditUrl}
				>
					Edit Post
				</Link>
				<Link
					className="flex mt-auto px-3 py-1 mb-2 tracking-wide rounded text-white bg-black whitespace-nowrap"
					href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${subdomain}.${
						process.env.NEXT_PUBLIC_DOMAIN_URL
					}${post.category?.slug ? '/' + post.category?.slug : ''}/${
						post.slug
					}`}
					onClick={(e) => e.stopPropagation()}
					rel="noreferrer"
					target="_blank"
				>
					View Post ↗
				</Link>
			</div>
			<StatusIndicator published={post.published} />
		</div>
	);
};

export default PostCard;
