import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import getSlug from 'speakingurl';

import Layout from '@/components/app/Layout';
import Modal from '@/components/Modal';
import LoadingDots from '@/components/app/loading-dots';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Category, Post } from '@prisma/client';
import PostCard from '@/components/app/PostCard';
import { toast } from 'react-hot-toast';
import AddNewButton from '@/components/app/AddNewButton';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';

interface CategoryWithPosts extends Category {
	posts: Post[];
}

export default function CategoryPosts() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [creatingPost, setCreatingPost] = useState(false);
	const postTitleRef = useRef<HTMLInputElement | null>(null);
	const postSlugRef = useRef<HTMLInputElement | null>(null);
	const router = useRouter();
	const { subdomain, categoryId } = router.query;

	const { data: category } = useSWR<CategoryWithPosts>(
		subdomain && `/api/category?categoryId=${categoryId}`,
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	async function createPost(subdomain: string | string[] | undefined) {
		if (!subdomain) return;
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
				toast.success(`Post Created`);
				setTimeout(() => {
					router.push(
						`/site/${subdomain}/categories/${categoryId}/posts/${data.postId}`
					);
				}, 100);
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
			<Header>
				<div className="flex justify-between items-center">
					<h1 className="text-4xl">Posts for {category?.title}</h1>
					<AddNewButton
						onClick={() => {
							setShowModal(true);
						}}
					>
						Add Post <span className="ml-2">＋</span>
					</AddNewButton>
				</div>
			</Header>
			<Container>
				<div className="my-10 grid gap-y-4">
					{category && category?.posts && category?.posts?.length > 0 ? (
						category.posts?.map((post) => (
							<PostCard
								post={post}
								postEditUrl={`/site/${subdomain}/categories/${category.id}/posts/${post.id}`}
								subdomain={subdomain}
								key={post.id}
							/>
						))
					) : (
						<div className="text-center">
							<p className="text-2xl mt-4 text-gray-600">
								No posts yet. Click &quot;Add Post&quot; to create one.
							</p>
						</div>
					)}
				</div>
			</Container>
			<Modal showModal={showModal} setShowModal={setShowModal}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						createPost(subdomain);
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded"
				>
					<div className="px-8">
						<h2 className="text-2xl mb-6">Add a New Post</h2>
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
								className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
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
