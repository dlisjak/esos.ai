import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, useRef } from 'react';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { ChangeEvent } from 'react';

import type { WithSitePost } from '@/types';
import BlurImage from '@/components/BlurImage';
import CloudinaryUploadWidget from '@/components/Cloudinary';
import { placeholderBlurhash } from '@/lib/utils';
import getSlug from 'speakingurl';
import { Category } from '@prisma/client';
import { StatusIndicator } from '@/components/app/PostCard';

interface PostData {
	title: string;
	slug: string;
	content: string;
	categoryId: string;
	image: string;
	imageBlurhash: string;
}

const CONTENT_PLACEHOLDER = `Write some content. Markdown supported:

# A H1 header

## A H2 header

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, and **bold**. Itemized lists look like:

  * this one
  * that one
  * the other one

Ordered lists look like:

  1. first item
  2. second item
  3. third item

> Block quotes are written like so.
>
> They can span multiple paragraphs,
> if you like.
`;

export default function Post() {
	const postSlugRef = useRef<HTMLInputElement | null>(null);
	const router = useRouter();

	const { subdomain, postId } = router.query;

	const { data: post } = useSWR<WithSitePost>(
		router.isReady && `/api/post?postId=${postId}`,
		fetcher,
		{
			dedupingInterval: 1000,
			onError: () => router.push('/'),
			revalidateOnFocus: false,
		}
	);

	const { data: categories } = useSWR<Category[]>(
		router.isReady && `/api/category`,
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	const [savedState, setSavedState] = useState(
		post
			? `Last saved at ${Intl.DateTimeFormat('en', { month: 'short' }).format(
					new Date(post.updatedAt)
			  )} ${Intl.DateTimeFormat('en', { day: '2-digit' }).format(
					new Date(post.updatedAt)
			  )} ${Intl.DateTimeFormat('en', {
					hour: 'numeric',
					minute: 'numeric',
			  }).format(new Date(post.updatedAt))}`
			: 'Saving changes...'
	);

	const [data, setData] = useState<PostData>({
		title: '',
		slug: '',
		content: '',
		categoryId: '',
		image: '',
		imageBlurhash: '',
	});

	useEffect(() => {
		if (post)
			setData({
				title: post.title ?? '',
				slug: post.slug ?? '',
				content: post.content ?? '',
				categoryId: post.categoryId ?? '',
				image: post.image ?? '',
				imageBlurhash: post.imageBlurhash ?? '',
			});
	}, [post]);

	const [debouncedData] = useDebounce(data, 1000);

	const saveChanges = useCallback(
		async (data: PostData) => {
			setSavedState('Saving changes...');

			try {
				const response = await fetch('/api/post', {
					method: HttpMethod.PUT,
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: postId,
						title: data.title,
						slug: data.slug,
						content: data.content,
						categoryId: data.categoryId,
						image: data.image,
						imageBlurhash: data.imageBlurhash,
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
		[postId]
	);

	useEffect(() => {
		if (debouncedData.title) saveChanges(debouncedData);
	}, [debouncedData, saveChanges]);

	const [publishing, setPublishing] = useState(false);
	const [drafting, setDrafting] = useState(false);
	const [disabled, setDisabled] = useState(true);

	useEffect(() => {
		if (data.title && data.slug && data.content && !publishing)
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

	async function draft() {
		try {
			const response = await fetch(`/api/post`, {
				method: HttpMethod.PUT,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: postId,
					title: data.title,
					slug: data.slug,
					content: data.content,
					categoryId: data.categoryId,
					published: false,
					subdomain: post?.site?.subdomain,
					customDomain: post?.site?.customDomain,
				}),
			});

			if (response.ok) {
				mutate(`/api/post?postId=${postId}`);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setDrafting(false);
		}
	}

	async function publish() {
		setPublishing(true);

		try {
			const response = await fetch(`/api/post`, {
				method: HttpMethod.PUT,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: postId,
					title: data.title,
					slug: data.slug,
					content: data.content,
					categoryId: data.categoryId,
					published: true,
					subdomain: post?.site?.subdomain,
					customDomain: post?.site?.customDomain,
				}),
			});

			if (response.ok) {
				mutate(`/api/post?postId=${postId}`);
				router.push(
					`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://app.${process.env.NEXT_PUBLIC_DOMAIN_URL}/site/${subdomain}/posts`
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

		if (!postSlugRef?.current) return;
		return setData({
			...data,
			slug: slug,
		});
	};

	return (
		<>
			<Layout siteId={post?.site?.id}>
				<div className="max-w-screen-xl mx-auto px-10 pt-16 mb-30">
					<div className="flex items-center mb-4">
						<TextareaAutosize
							name="title"
							onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
								setData({
									...data,
									title: (e.target as HTMLTextAreaElement).value,
								})
							}
							className="w-full px-2 py-4 text-gray-800 placeholder-gray-400 border-t-0 border-l-0 border-r-0 border-b text-5xl resize-none focus:outline-none focus:ring-0 mb-2"
							placeholder="Untitled Category"
							value={data.title || ''}
							onBlur={generateSlug}
						/>
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
							className={`ml-4 ${
								disabled
									? 'cursor-not-allowed bg-gray-300 border-gray-300'
									: 'bg-black hover:bg-white hover:text-black border-black'
							} mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
						>
							{publishing ? <LoadingDots /> : 'Publish  →'}
						</button>
					</div>
					<div className="flex w-full space-x-4">
						<div className="flex flex-col w-full">
							<p>Slug</p>
							<input
								className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
								name="slug"
								required
								placeholder="Post Slug"
								ref={postSlugRef}
								type="text"
								value={data.slug}
								onChange={(e) =>
									setData({
										...data,
										slug: (e.target as HTMLInputElement).value,
									})
								}
							/>
						</div>
						<div className="flex flex-col w-full">
							<p>Category</p>
							<div className="border border-gray-700 rounded-lg overflow-hidden w-full flex items-center max-w-lg">
								<select
									onChange={(e) =>
										setData((data) => ({
											...data,
											categoryId: (e.target as HTMLSelectElement).value,
										}))
									}
									value={data.categoryId || post?.categoryId || ''}
									className="w-full px-5 py-3  text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none placeholder-gray-400"
								>
									<option value="" disabled>
										Select a Category
									</option>
									{categories &&
										categories?.map((category) => (
											<option value={category.id} key={category.id}>
												{category.title}
											</option>
										))}
								</select>
							</div>
						</div>
					</div>
					<div>
						<p className="mt-8">Content</p>
						<TextareaAutosize
							name="content"
							onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
								setData({
									...data,
									content: (e.target as HTMLTextAreaElement).value,
								})
							}
							minRows={6}
							className="w-full px-2 py-3 text-gray-800 placeholder-gray-400 text-xl mb-3 resize-none border-gray-400 rounded focus:outline-none focus:ring-0"
							placeholder={CONTENT_PLACEHOLDER}
							value={data.content}
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
								blurDataURL={data.imageBlurhash || placeholderBlurhash}
							/>
						)}
					</div>
				</div>
				<footer className="h-20 z-5 fixed bottom-0 inset-x-0 border-solid border-t border-gray-500 bg-white">
					<div className="max-w-screen-xl mx-auto px-10 sm:px-20 h-full flex justify-between items-center">
						<div className="text-sm">
							<strong>
								<p>{post?.published ? 'Published' : 'Draft'}</p>
							</strong>
							<p>{savedState}</p>
						</div>
						<button
							onClick={async () => {
								await draft();
							}}
							title="Draft"
							disabled={!post?.published}
							className={`${
								!post?.published
									? 'cursor-not-allowed bg-gray-300 border-gray-300'
									: 'bg-black hover:bg-white hover:text-black border-black'
							} mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150 ml-auto`}
						>
							{drafting ? <LoadingDots /> : 'Draft  →'}
						</button>
						<button
							onClick={async () => {
								await publish();
							}}
							title={
								disabled
									? 'Post must have a title, description, and content to be published.'
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
						<StatusIndicator
							className="relative right-0"
							published={post?.published}
						/>{' '}
					</div>
				</footer>
			</Layout>
		</>
	);
}
