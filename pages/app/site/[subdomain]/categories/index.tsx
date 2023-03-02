import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import getSlug from 'speakingurl';
import { toast, Toaster } from 'react-hot-toast';
import useSWR from 'swr';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';
import CategoryCard from '@/components/app/CategoryCard';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Category } from '@prisma/client';

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

	const { data: parentCategories } = useSWR<Array<Category> | null>(
		`/api/category/parents?subdomain=${subdomain}`,
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	const { data: childCategories } = useSWR<Array<Category> | null>(
		`/api/category/children?subdomain=${subdomain}`,
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
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 10000,
				}}
			/>
			<div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
				<div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
					<h1 className="text-5xl">Categories</h1>
					<button
						onClick={() => {
							setShowCategoryModal(true);
						}}
						className={`${
							creatingCategory
								? 'cursor-not-allowed bg-gray-300 border-gray-300'
								: 'text-white bg-black hover:bg-white hover:text-black border-black'
						}  text-lg tracking-wide border-2 px-5 py-3 transition-all ease-in-out duration-150`}
					>
						{creatingCategory ? (
							<LoadingDots />
						) : (
							<>
								New Category <span className="ml-2">＋</span>
							</>
						)}
					</button>
				</div>
				<div className="my-10 grid gap-y-4">
					{parentCategories && parentCategories?.length > 0 ? (
						parentCategories?.map((category) => (
							<div className="flex flex-col" key={category.id}>
								<CategoryCard
									subdomain={subdomain}
									category={category}
									addPostClick={handleAddPostClick}
								/>
								{childCategories &&
									childCategories?.map((child) => {
										if (category.id !== child.parentId) return;
										return (
											<CategoryCard
												subdomain={subdomain}
												category={child}
												addPostClick={handleAddPostClick}
												isChild={true}
												key={child.id}
											/>
										);
									})}
							</div>
						))
					) : (
						<div className="text-center">
							<p className="text-2xl  text-gray-600">
								No categories yet. Click &quot;New Category&quot; to create one.
							</p>
						</div>
					)}
				</div>
			</div>
			<Modal showModal={showCategoryModal} setShowModal={setShowCategoryModal}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						createCategory(subdomain);
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded-lg"
				>
					<div className="px-8">
						<h2 className="text-2xl mb-6">Create a New Category</h2>
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
