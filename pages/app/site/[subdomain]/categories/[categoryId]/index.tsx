import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, useRef } from 'react';

import Layout from '@/components/app/Layout';
import Loader from '@/components/app/Loader';
import LoadingDots from '@/components/app/loading-dots';
import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { ChangeEvent } from 'react';

import type { WithSiteCategory } from '@/types';
import BlurImage from '@/components/BlurImage';
import CloudinaryUploadWidget from '@/components/Cloudinary';
import { placeholderBlurhash } from '@/lib/utils';
import getSlug from 'speakingurl';

interface CategoryData {
	id: string;
	title: string;
	description: string;
	slug: string;
	image: string;
}

const CONTENT_PLACEHOLDER = `Write some content. Markdown supported:
# A H1 header
## A H2 header

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, and **bold**.`;

export default function Category() {
	const router = useRouter();
	const categorySlugRef = useRef<HTMLInputElement | null>(null);

	// TODO: Undefined check redirects to error
	const { categoryId } = router.query;

	const { data: category, isValidating } = useSWR<WithSiteCategory>(
		router.isReady && `/api/category?categoryId=${categoryId}`,
		fetcher,
		{
			dedupingInterval: 1000,
			onError: () => router.push('/'),
			revalidateOnFocus: false,
		}
	);

	const [savedState, setSavedState] = useState(
		category
			? `Last saved at ${Intl.DateTimeFormat('en', { month: 'short' }).format(
					new Date(category?.updatedAt)
			  )} ${Intl.DateTimeFormat('en', { day: '2-digit' }).format(
					new Date(category?.updatedAt)
			  )} ${Intl.DateTimeFormat('en', {
					hour: 'numeric',
					minute: 'numeric',
			  }).format(new Date(category?.updatedAt))}`
			: 'Saving changes...'
	);

	const [data, setData] = useState<CategoryData>({
		id: '',
		title: '',
		description: '',
		slug: '',
		image: '',
	});

	useEffect(() => {
		if (category)
			setData({
				id: category.id ?? '',
				title: category.title ?? '',
				description: category.description ?? '',
				slug: category.slug ?? '',
				image: category.image ?? '',
			});
	}, [categoryId, category]);

	const [debouncedData] = useDebounce(data, 1000);

	const saveChanges = useCallback(
		async (data: CategoryData) => {
			setSavedState('Saving changes...');

			try {
				const response = await fetch('/api/category', {
					method: HttpMethod.PUT,
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: categoryId,
						title: data.title,
						description: data.description,
						slug: data.slug,
						image: data.image,
					}),
				});

				if (response.ok) {
					const responseData = await response.json();
					setSavedState(
						`Last save ${Intl.DateTimeFormat('en', { month: 'short' }).format(
							new Date(responseData.updatedAt)
						)} ${Intl.DateTimeFormat('en', { day: '2-digit' }).format(
							new Date(responseData.updatedAt)
						)} at ${Intl.DateTimeFormat('en', {
							hour: 'numeric',
							minute: 'numeric',
						}).format(new Date(responseData.updatedAt))}`
					);
				} else {
					setSavedState('Failed to save.');
					toast.error('Failed to save');
				}
			} catch (error) {
				console.error(error);
			}
		},
		[categoryId]
	);

	useEffect(() => {
		if (debouncedData.title) saveChanges(debouncedData);
	}, [debouncedData, saveChanges]);

	const [publishing, setPublishing] = useState(false);
	const [disabled, setDisabled] = useState(true);

	useEffect(() => {
		if (data.title && data.slug && data.description && !publishing)
			setDisabled(false);
		else setDisabled(true);
	}, [publishing, data]);

	useEffect(() => {
		function clickedSave(e: KeyboardEvent) {
			let charCode = String.fromCharCode(e.which).toLowerCase();

			if ((e.ctrlKey || e.metaKey) && charCode === 's') {
				e.preventDefault();
				saveChanges(data);
			}
		}

		window.addEventListener('keydown', clickedSave);

		return () => window.removeEventListener('keydown', clickedSave);
	}, [data, saveChanges]);

	async function publish() {
		setPublishing(true);

		try {
			const response = await fetch(`/api/category`, {
				method: HttpMethod.PUT,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: categoryId,
					title: data.title,
					description: data.description,
					slug: data.slug,
					image: data.image,
				}),
			});

			if (response.ok) {
				mutate(`/api/category?categoryId=${categoryId}`);
				router.push(
					`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://app.${process.env.NEXT_PUBLIC_DOMAIN_URL}/site/${category?.siteId}/categories`
				);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setPublishing(false);
		}
	}

	const generateSlug = (e) => {
		const title = data.title;
		const slug = getSlug(title);

		if (!categorySlugRef?.current) return;
		return setData({
			...data,
			slug: slug,
		});
	};

	if (isValidating)
		return (
			<Layout>
				<Loader />
			</Layout>
		);

	return (
		<>
			<Layout siteId={category?.site?.id}>
				<div className="max-w-screen-xl mx-auto px-10 sm:px-20 mt-10 mb-30">
					<TextareaAutosize
						name="title"
						onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
							setData({
								...data,
								title: (e.target as HTMLTextAreaElement).value,
							})
						}
						className="w-full px-2 py-4 text-gray-800 placeholder-gray-400 mt-6 text-5xl  resize-none border-none focus:outline-none focus:ring-0"
						placeholder="Untitled Category"
						value={data.title}
						onBlur={generateSlug}
					/>
					<p>Slug</p>
					<input
						className="w-full max-w-[24rem] px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
						name="slug"
						required
						placeholder="Category Slug"
						ref={categorySlugRef}
						type="text"
						value={data.slug}
						onChange={(e) =>
							setData({
								...data,
								slug: (e.target as HTMLInputElement).value,
							})
						}
					/>
					<div>
						<p className="mt-8">Description</p>
						<TextareaAutosize
							name="description"
							onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
								setData({
									...data,
									description: (e.target as HTMLTextAreaElement).value,
								})
							}
							className="w-full px-2 py-3 text-gray-800 placeholder-gray-400 text-xl mb-3 resize-none border-gray-400 rounded focus:outline-none focus:ring-0"
							placeholder="No description provided. Click to edit."
							minRows={6}
							value={data.description}
						/>
					</div>

					<div
						className={`${
							data.image ? '' : 'animate-pulse bg-gray-300 h-150'
						} relative mt-5 w-full border-2 border-gray-800 border-dashed rounded max-w-lg overflow-hidden`}
					>
						<CloudinaryUploadWidget
							callback={(e) =>
								setData({
									...data,
									image: e.secure_url,
								})
							}
						>
							{({ open }) => (
								<button
									onClick={open}
									className="absolute w-full h-full rounded-md bg-gray-200 z-10 flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-all ease-linear duration-200"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="100"
										height="100"
										viewBox="0 0 24 24"
									>
										<path d="M16 16h-3v5h-2v-5h-3l4-4 4 4zm3.479-5.908c-.212-3.951-3.473-7.092-7.479-7.092s-7.267 3.141-7.479 7.092c-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h3.5v-2h-3.5c-1.93 0-3.5-1.57-3.5-3.5 0-2.797 2.479-3.833 4.433-3.72-.167-4.218 2.208-6.78 5.567-6.78 3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5h-3.5v2h3.5c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408z" />
									</svg>
									<p>Upload category image</p>
								</button>
							)}
						</CloudinaryUploadWidget>

						{data.image && (
							<BlurImage
								src={data.image}
								alt="Cover Photo"
								width={800}
								height={500}
								placeholder="blur"
								className="rounded-md w-full h-full object-cover"
								blurDataURL={data.image || placeholderBlurhash}
							/>
						)}
					</div>
				</div>
				<footer className="h-20 z-5 fixed bottom-0 inset-x-0 border-solid border-t border-gray-500 bg-white">
					<div className="max-w-screen-xl mx-auto px-10 sm:px-20 h-full flex justify-between items-center">
						<button
							onClick={async () => {
								await publish();
							}}
							title={
								disabled
									? 'Category must have a title, description, and a slug to be published.'
									: 'Publish'
							}
							disabled={disabled}
							className={`${
								disabled
									? 'cursor-not-allowed bg-gray-300 border-gray-300'
									: 'bg-black hover:bg-white hover:text-black border-black'
							} mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
						>
							{publishing ? <LoadingDots /> : 'Publish  →'}
						</button>
					</div>
				</footer>
			</Layout>
		</>
	);
}
