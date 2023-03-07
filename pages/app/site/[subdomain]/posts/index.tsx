import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import getSlug from 'speakingurl';

import Layout from '@/components/app/Layout';
import Modal from '@/components/Modal';
import LoadingDots from '@/components/app/loading-dots';

import { HttpMethod } from '@/types';

import PostCard from '@/components/app/PostCard';
import { toast } from 'react-hot-toast';
import AddNewButton from '@/components/app/AddNewButton';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import Loader from '@/components/app/Loader';
import { useSubdomainPosts } from '@/lib/queries';

export default function Posts() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [creatingPost, setCreatingPost] = useState(false);
	const postTitleRef = useRef<HTMLInputElement | null>(null);
	const postSlugRef = useRef<HTMLInputElement | null>(null);
	const [deletingPostId, setDeletingPostId] = useState();
	const [deletingPostTitle, setDeletingPostTitle] = useState();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingPost, setDeletingPost] = useState(false);
	const router = useRouter();
	const { subdomain } = router.query;

	const { posts, isLoading, mutateSubdomainPosts } = useSubdomainPosts(
		subdomain,
		true
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
				toast.success('Post Created');
				router.push(`/site/${subdomain}/posts/${data.postId}`);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function deletePost(postId) {
		if (!postId) return;
		setDeletingPost(true);

		try {
			const res = await fetch(`/api/post?postId=${postId}`, {
				method: HttpMethod.DELETE,
			});

			if (res.ok) {
				toast.success(`Post Deleted`);
				mutateSubdomainPosts();
			}
		} catch (error) {
			console.error(error);
		} finally {
			setDeletingPost(false);
			setShowDeleteModal(false);
		}
	}

	const generateSlug = (e) => {
		const title = e.target.value;
		const slug = getSlug(title);

		if (!postSlugRef?.current) return;
		postSlugRef.current.value = slug;
	};

	const handleRemovePostClick = (postId, postTitle) => {
		setDeletingPostId(postId);
		setDeletingPostTitle(postTitle);
		setShowDeleteModal(true);
	};

	if (isLoading) return <Loader />;

	return (
		<Layout>
			<Header>
				<div className="flex justify-between items-center">
					<h1 className="text-4xl">Published</h1>
					<AddNewButton onClick={() => setShowModal(true)}>
						Add Post <span className="ml-2">＋</span>
					</AddNewButton>
				</div>
			</Header>
			<Container dark>
				<div className="grid gap-y-4">
					{posts && posts?.length > 0 ? (
						posts?.map((post) => (
							<PostCard
								post={post}
								postEditUrl={`/site/${subdomain}/posts/${post.id}`}
								subdomain={subdomain}
								removePostClick={handleRemovePostClick}
								key={post.id}
							/>
						))
					) : (
						<div className="text-center">
							<p className="text-2xl my-4 text-gray-600">
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
			<Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						await deletePost(deletingPostId);
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded"
				>
					<h2 className=" text-2xl mb-6">Delete Post</h2>
					<div className="grid gap-y-4 w-5/6 mx-auto">
						<p className="text-gray-600 mb-3">
							Are you sure you want to delete your post:{' '}
							<b>{deletingPostTitle}</b>? This action is not reversible. Type in{' '}
							<span className="bg-slate-200 px-1">delete</span> to confirm.
						</p>
						<div className="border border-gray-700 rounded flex flex-start items-center overflow-hidden">
							<input
								className="w-full px-5 py-3 text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none rounded-r-lg placeholder-gray-400"
								type="text"
								name="name"
								placeholder="delete"
								pattern="delete"
							/>
						</div>
					</div>
					<div className="flex justify-between items-center mt-10 w-full">
						<button
							type="button"
							className="w-full px-5 py-5 text-sm text-gray-400 hover:text-black border-t border-gray-300 rounded-bl focus:outline-none focus:ring-0 transition-all ease-in-out duration-150"
							onClick={() => setShowDeleteModal(false)}
						>
							CANCEL
						</button>

						<button
							type="submit"
							disabled={deletingPost}
							className={`${
								deletingPost
									? 'cursor-not-allowed text-gray-400 bg-gray-50'
									: 'bg-white text-gray-600 hover:text-black'
							} w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
						>
							{deletingPost ? <LoadingDots /> : 'DELETE POST'}
						</button>
					</div>
				</form>
			</Modal>
		</Layout>
	);
}
