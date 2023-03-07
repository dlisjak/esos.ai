import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useS3Upload } from 'next-s3-upload';

import Layout from '@/components/app/Layout';
import Loader from '@/components/app/Loader';
import LoadingDots from '@/components/app/loading-dots';
import { HttpMethod } from '@/types';

import type { ChangeEvent } from 'react';

import BlurImage from '@/components/BlurImage';
import { placeholderBlurhash } from '@/lib/utils';
import getSlug from 'speakingurl';
import { StatusIndicator } from '@/components/app/PostCard';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';
import { useSession } from 'next-auth/react';
import { useCategories, usePost } from '@/lib/queries';

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
	const [imagePreview, setImagePreview] = useState<any>();
	const [imageData, setImageData] = useState<any>();
	const { FileInput, uploadToS3 } = useS3Upload();
	const [publishing, setPublishing] = useState(false);
	const [drafting, setDrafting] = useState(false);
	const [disabled, setDisabled] = useState(true);
	const { data: session } = useSession();
	const router = useRouter();

	const { subdomain, categoryId, postId } = router.query;
	const sessionUser = session?.user?.name;

	const { post, isLoading, isError, mutatePost } = usePost(postId);

	const { categories } = useCategories();

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
	}, [post, categoryId]);

	useEffect(() => {
		if (data.title && data.slug && data.content && !publishing)
			setDisabled(false);
		else setDisabled(true);
	}, [publishing, data]);

	const uploadImage = async (file) => {
		const path = `${sessionUser}/${subdomain}/${data.categoryId}/${postId}`;

		const { url } = await uploadToS3(file, {
			endpoint: {
				request: {
					body: {
						path,
					},
				},
			},
		});
		return url;
	};

	async function draft() {
		if (!postId || !data.title || !data.slug || !data.content || !categoryId)
			return toast.error('Make sure the post has required data');

		setDrafting(true);
		let imageUrl;

		if (imageData) {
			imageUrl = await uploadImage(imageData);
		}

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
					image: imageUrl,
					categoryId: categoryId,
					published: false,
				}),
			});

			if (response.ok) {
				mutatePost();
				toast.success('Draft succesfully saved');
			}
		} catch (error) {
			console.error(error);
		} finally {
			setDrafting(false);
		}
	}

	async function publish() {
		if (!postId || !data.title || !data.slug || !data.content || !categoryId)
			return toast.error('Make sure the post has required data');

		setPublishing(true);
		let imageUrl;

		if (imageData) {
			imageUrl = await uploadImage(imageData);
		}

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
					categoryId: categoryId,
					image: imageUrl,
					published: true,
				}),
			});

			if (response.ok) {
				mutatePost();
				router.push(`/site/${subdomain}/categories/${categoryId}/posts`);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setPublishing(false);
		}
	}

	const handleImageSelect = async (file) => {
		const imagePreviewSrc = URL.createObjectURL(file);

		setImagePreview(imagePreviewSrc);
		return setImageData(file);
	};

	const generateSlug = (e) => {
		const title = data.title;
		const slug = getSlug(title);

		if (!postSlugRef?.current) return;
		return setData({
			...data,
			slug: slug,
		});
	};

	if (isLoading) return <Loader />;

	return (
		<>
			<Layout>
				<Header>
					<div className="flex justify-between items-center">
						<h1 className="text-4xl">Edit Post</h1>
						<button
							onClick={async () => {
								await publish();
							}}
							title={
								disabled
									? 'Post must have a title, description, category and a slug to be published.'
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
				</Header>
				<Container className="pb-24">
					<TextareaAutosize
						name="title"
						onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
							setData({
								...data,
								title: (e.target as HTMLTextAreaElement).value,
							})
						}
						className="w-full px-2 py-4 text-gray-800 placeholder-gray-400 border-t-0 border-l-0 border-r-0 border-b text-4xl resize-none focus:outline-none focus:ring-0 mb-2"
						placeholder="Untitled Category"
						value={data.title || ''}
						onBlur={generateSlug}
					/>
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
							<div className="border border-gray-700 rounded overflow-hidden w-full flex items-center max-w-lg">
								<select
									onChange={(e) =>
										setData((data) => ({
											...data,
											categoryId: (e.target as HTMLSelectElement).value,
										}))
									}
									value={data.categoryId || categoryId || ''}
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
					<div className="flex space-x-6 items-end">
						<div className="w-full max-w-lg">
							<p>Category Image</p>
							<div
								className={`relative w-[480px] h-[480px] ${
									data.image ? '' : 'animate-pulse bg-gray-300 h-150'
								} relative w-full border-2 border-gray-800 border-dashed rounded overflow-hidden`}
							>
								<FileInput
									className="fileUpload absolute cursor-pointer z-50 opacity-0 left-0 top-0 bottom-0 right-0"
									onChange={handleImageSelect}
								/>
								{(imagePreview || data.image) && (
									<BlurImage
										src={imagePreview || data.image}
										alt="Upload Category Image"
										width={800}
										height={500}
										placeholder="blur"
										className="rounded cursor-pointer w-full h-full object-contain"
										blurDataURL={
											imagePreview || data.image || placeholderBlurhash
										}
									/>
								)}
							</div>
						</div>
					</div>
				</Container>
				<footer className="h-20 z-5 fixed bottom-0 inset-x-0 border-solid border-t border-gray-500 bg-white">
					<div className="max-w-screen-lg mx-auto h-full flex justify-between items-center">
						<div className="text-sm">
							<strong>
								<p>{post?.published ? 'Published' : 'Draft'}</p>
							</strong>
						</div>
						<button
							onClick={async () => {
								await draft();
							}}
							title="Draft"
							disabled={drafting}
							className={`ml-auto ${
								drafting
									? 'cursor-not-allowed bg-gray-300 border-gray-300'
									: 'bg-black hover:bg-white hover:text-black border-black'
							} mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
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
						/>
					</div>
				</footer>
			</Layout>
		</>
	);
}
