import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import getSlug from 'speakingurl';
import toast, { Toaster } from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Site, Category } from '@prisma/client';
import Link from 'next/link';
import BlurImage from '@/components/BlurImage';

export default function SiteCategories() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [creatingCategory, setCreatingCategory] = useState<boolean>(false);
	const categoryTitleRef = useRef<HTMLInputElement | null>(null);
	const categorySlugRef = useRef<HTMLInputElement | null>(null);
	const router = useRouter();
	const { id } = router.query;
	const siteId = id;

	const { data: categories } = useSWR<Array<Category> | null>(
		`/api/category?siteId=${siteId}`,
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	async function createCategory(siteId: string) {
		setCreatingCategory(true);
		if (!categoryTitleRef.current || !categorySlugRef.current) return;
		const title = categoryTitleRef.current.value;
		const slug = categorySlugRef.current.value;
		const data = { title, slug };

		try {
			const res = await fetch(`/api/category?siteId=${siteId}`, {
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (res.ok) {
				router.push(`/category/${slug}`);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setCreatingCategory(false);
		}
	}

	const generateSlug = (e) => {
		const title = e.target.value;
		const slug = getSlug(title);

		if (!categorySlugRef?.current) return;
		categorySlugRef.current.value = slug;
	};

	return (
		<Layout>
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 10000,
				}}
			/>
			<div className="max-w-screen-xl mx-auto px-10 sm:px-20 mt-20 mb-16">
				<div className="flex justify-between items-center">
					<h1 className="text-5xl mb-12">Categories</h1>
					<button
						onClick={() => {
							setShowModal(true);
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
					{categories?.map((category) => (
						<Link
							href={`/site/${category.siteId}/categories/${category.id}`}
							key={category.id}
						>
							<div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
								<div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none">
									{category.image ? (
										<BlurImage
											alt={category.title ?? 'Unknown Thumbnail'}
											width={500}
											height={400}
											className="h-full object-cover"
											src={category.image}
										/>
									) : (
										<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl">
											?
										</div>
									)}
								</div>
								<div className="relative p-10">
									<h2 className=" text-3xl">{category.title}</h2>
									<p className="text-base my-5 line-clamp-3">
										{category.description}
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
			<Modal showModal={showModal} setShowModal={setShowModal}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						createCategory(siteId);
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
								setShowModal(false);
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
		</Layout>
	);
}
