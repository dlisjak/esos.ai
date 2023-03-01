import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import getSlug from 'speakingurl';

import BlurImage from '@/components/BlurImage';
import Layout from '@/components/app/Layout';
import Modal from '@/components/Modal';
import LoadingDots from '@/components/app/loading-dots';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Post, Site } from '@prisma/client';

interface SitePostData {
	posts: Array<Post>;
	site: Site | null;
}

export default function Posts() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [creatingPost, setCreatingPost] = useState(false);
	const postTitleRef = useRef<HTMLInputElement | null>(null);
	const postSlugRef = useRef<HTMLInputElement | null>(null);
	const router = useRouter();
	const { subdomain } = router.query;

	const { data } = useSWR<SitePostData>(
		subdomain && `/api/post?subdomain=${subdomain}&published=true`,
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	const posts = data?.posts;
	const site = data?.site;

	async function createPost(subdomain: string | string[]) {
		setCreatingPost(true);
		if (!postTitleRef.current || !postSlugRef.current) return;
		const title = postTitleRef.current.value;
		const slug = postSlugRef.current.value;
		const data = { title, slug };

		try {
			const res = await fetch(`/api/post?subdomain=${subdomain}`, {
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (res.ok) {
				const data = await res.json();
				router.push(`/site/${subdomain}/posts/${data.postId}`);
			}
		} catch (error) {
			console.error(error);
		}
	}

	const generateSlug = (e) => {
		const title = e.target.value;
		const slug = getSlug(title);

		if (!postSlugRef?.current) return;
		postSlugRef.current.value = slug;
	};

	return (
		<Layout>
			<div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
				<div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
					<h1 className="text-5xl">Published</h1>
					<button
						onClick={() => {
							setShowModal(true);
						}}
						className={`${
							creatingPost
								? 'cursor-not-allowed bg-gray-300 border-gray-300'
								: 'text-white bg-black hover:bg-white hover:text-black border-black'
						}  text-lg w-3/4 sm:w-40 tracking-wide border-2 px-5 py-3 transition-all ease-in-out duration-150`}
					>
						{creatingPost ? (
							<LoadingDots />
						) : (
							<>
								New Post <span className="ml-2">＋</span>
							</>
						)}
					</button>
				</div>
				<div className="my-10 grid gap-y-10">
					{posts?.length > 0 ? (
						posts?.map((post) => (
							<Link href={`/site/${subdomain}/posts/${post.id}`} key={post.id}>
								<div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
									<div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none">
										{post.image ? (
											<BlurImage
												alt={post.title ?? 'Unknown Thumbnail'}
												width={500}
												height={400}
												className="h-full object-cover"
												src={post.image}
											/>
										) : (
											<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl">
												?
											</div>
										)}
									</div>
									<div className="relative p-10">
										<h2 className=" text-3xl">{post.title}</h2>
										<p className="text-base my-5 line-clamp-3">
											{post.description}
										</p>
										<Link
											className=" px-3 py-1 tracking-wide rounded bg-gray-200 text-gray-600 absolute bottom-5 left-10 whitespace-nowrap"
											href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${site?.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}/${post.slug}`}
											onClick={(e) => e.stopPropagation()}
											rel="noreferrer"
											target="_blank"
										>
											{site?.subdomain}.{process.env.NEXT_PUBLIC_DOMAIN_URL}/
											{post.slug} ↗
										</Link>
									</div>
								</div>
							</Link>
						))
					) : (
						<div className="text-center">
							<p className="text-2xl  text-gray-600">
								No posts yet. Click &quot;New Post&quot; to create one.
							</p>
						</div>
					)}
				</div>
			</div>
			<Modal showModal={showModal} setShowModal={setShowModal}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						createPost(subdomain);
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded-lg"
				>
					<div className="px-8">
						<h2 className="text-2xl mb-6">Create a New Post</h2>
						<div className="flex flex-col space-y-4 flex-start items-center">
							<input
								className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
								name="title"
								required
								placeholder="Post Title"
								ref={postTitleRef}
								type="text"
								onBlur={generateSlug}
							/>
							<input
								className="hidden w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
								name="slug"
								required
								placeholder="Post Slug"
								ref={postSlugRef}
								type="text"
							/>
						</div>
					</div>
					<div className="flex justify-between items-center mt-10 w-full">
						<button
							type="button"
							className="w-full px-5 py-5 text-sm text-gray-600 hover:text-black border-t border-gray-300 rounded-bl focus:outline-none focus:ring-0 transition-all ease-in-out duration-150"
							onClick={() => {
								setShowModal(false);
							}}
						>
							CANCEL
						</button>

						<button
							type="submit"
							disabled={creatingPost}
							className={`${
								creatingPost
									? 'cursor-not-allowed text-gray-400 bg-gray-50'
									: 'bg-white text-gray-600 hover:text-black'
							} w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
						>
							{creatingPost ? <LoadingDots /> : 'CREATE CATEGORY'}
						</button>
					</div>
				</form>
			</Modal>
		</Layout>
	);
}
