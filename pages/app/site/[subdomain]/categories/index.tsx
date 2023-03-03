import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import getSlug from 'speakingurl';
import { toast, Toaster } from 'react-hot-toast';
import useSWR from 'swr';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';
import CategoryCard, { CategoryList } from '@/components/app/CategoryCard';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Category, Post } from '@prisma/client';
import AddNewButton from '@/components/app/AddNewButton';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';

interface CategoryWithPosts extends Category {
	posts: Post[];
}

export default function SiteCategories() {
	const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
	const [showPostModal, setShowPostModal] = useState<boolean>(false);
	const [creatingCategory, setCreatingCategory] = useState<boolean>(false);
	const [creatingPost, setCreatingPost] = useState(false);
	const [creatingPostCategoryId, setCreatingPostCategoryId] = useState();
	const postTitleRef = useRef<HTMLInputElement | null>(null);
	const postSlugRef = useRef<HTMLInputElement | null>(null);
	const categoryTitleRef = useRef<HTMLInputElement | null>(null);
	const categorySlugRef = useRef<HTMLInputElement | null>(null);
	const router = useRouter();
	const { subdomain } = router.query;

	const { data: categories } = useSWR<Array<CategoryWithPosts> | null>(
		`/api/category?subdomain=${subdomain}`,
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	async function createCategory(subdomain: string | string[] | undefined) {
		if (!subdomain) return;
		setCreatingCategory(true);
		if (!categoryTitleRef.current || !categorySlugRef.current) return;
		const title = categoryTitleRef.current.value;
		const slug = categorySlugRef.current.value;
		const data = { title, slug };

		try {
			const res = await fetch(`/api/category?subdomain=${subdomain}`, {
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (res.ok) {
				const { categoryId } = await res.json();
				toast.success(`Category Created`);
				setTimeout(() => {
					router.push(`/site/${subdomain}/categories/${categoryId}`);
				}, 100);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setCreatingCategory(false);
		}
	}

	async function createPost(
		subdomain: string | string[] | undefined,
		categoryId: string | string[] | undefined
	) {
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
		} finally {
			setCreatingPost(false);
			setShowPostModal(false);
		}
	}

	const generateSlug = (e) => {
		const title = e.target.value;
		const slug = getSlug(title);

		if (showCategoryModal) {
			if (!categorySlugRef?.current) return;
			categorySlugRef.current.value = slug;
		}

		if (showPostModal) {
			if (!postSlugRef?.current) return;
			postSlugRef.current.value = slug;
		}
	};

	const handleAddPostClick = (categoryId) => {
		setCreatingPostCategoryId(categoryId);
		setShowPostModal(true);
	};

	return (
		<Layout>
			<Header>
				<div className="flex justify-between items-center">
					<h1 className="text-4xl">Categories</h1>
					<AddNewButton onClick={() => setShowCategoryModal(true)}>
						Add Category <span className="ml-2">＋</span>
					</AddNewButton>
				</div>
			</Header>
			<Container dark>
				{categories && categories?.length > 0 ? (
					<CategoryList
						categories={categories}
						subdomain={subdomain}
						addPostClick={handleAddPostClick}
					/>
				) : (
					<div className="text-center">
						<p className="text-2xl my-4 text-gray-600">
							No categories yet. Click &quot;Add Category&quot; to create one.
						</p>
					</div>
				)}
			</Container>
			<Modal showModal={showCategoryModal} setShowModal={setShowCategoryModal}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						createCategory(subdomain);
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded"
				>
					<div className="px-8">
						<h2 className="text-2xl mb-6">Add a New Category</h2>
						<div className="flex flex-col space-y-4 flex-start items-center">
							<input
								className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
								name="title"
								required
								placeholder="Category Title"
								ref={categoryTitleRef}
								type="text"
								onBlur={generateSlug}
							/>
							<input
								className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
								name="slug"
								required
								placeholder="Category Slug"
								ref={categorySlugRef}
								type="text"
							/>
						</div>
					</div>
					<div className="flex justify-between items-center mt-10 w-full">
						<button
							type="button"
							className="w-full px-5 py-5 text-sm text-gray-600 hover:text-black border-t border-gray-300 rounded-bl focus:outline-none focus:ring-0 transition-all ease-in-out duration-150"
							onClick={() => {
								setShowCategoryModal(false);
							}}
						>
							CANCEL
						</button>

						<button
							type="submit"
							disabled={creatingCategory}
							className={`${
								creatingCategory
									? 'cursor-not-allowed text-gray-400 bg-gray-50'
									: 'bg-white text-gray-600 hover:text-black'
							} w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
						>
							{creatingCategory ? <LoadingDots /> : 'CREATE CATEGORY'}
						</button>
					</div>
				</form>
			</Modal>
			<Modal showModal={showPostModal} setShowModal={setShowPostModal}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						createPost(subdomain, creatingPostCategoryId);
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
								setShowPostModal(false);
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
