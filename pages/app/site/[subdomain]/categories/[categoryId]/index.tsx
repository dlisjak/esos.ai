import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useS3Upload } from 'next-s3-upload';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';

import { HttpMethod } from '@/types';

import type { ChangeEvent } from 'react';

import { placeholderBlurhash } from '@/lib/utils';
import getSlug from 'speakingurl';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import { useSession } from 'next-auth/react';
import { useCategories, useCategory } from '@/lib/queries';
import Loader from '@/components/app/Loader';
import Image from 'next/image';

interface CategoryData {
	id: string;
	title: string;
	description: string;
	slug: string;
	parentId: string;
	image: string;
	imageBlurhash: string;
}

export default function CategoryPage() {
	const router = useRouter();
	const categorySlugRef = useRef<HTMLInputElement | null>(null);
	const [deletingCategory, setDeletingCategory] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [imagePreview, setImagePreview] = useState<any>();
	const [imageData, setImageData] = useState<any>();
	const { FileInput, uploadToS3 } = useS3Upload();
	const [publishing, setPublishing] = useState(false);
	const [disabled, setDisabled] = useState(true);

	const { subdomain, categoryId } = router.query;

	const { data: session } = useSession();
	const sessionUser = session?.user?.name;

	const { category, isLoading, isError, mutateCategory } =
		useCategory(categoryId);

	const { categories } = useCategories();

	const [data, setData] = useState<CategoryData>({
		id: '',
		title: '',
		description: '',
		slug: '',
		parentId: '',
		image: '',
		imageBlurhash: '',
	});

	useEffect(() => {
		if (category)
			setData({
				id: category.id ?? '',
				title: category.title ?? '',
				description: category.description ?? '',
				parentId: category.parentId ?? '',
				slug: category.slug ?? '',
				image: category.image ?? '',
				imageBlurhash: category.imageBlurhash ?? '',
			});
	}, [category]);

	useEffect(() => {
		if (data.title && data.slug && data.description && !publishing)
			setDisabled(false);
		else setDisabled(true);
	}, [publishing, data]);

	const uploadImage = async (file) => {
		const path = `${sessionUser}/${subdomain}/${data.id}`;

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

	async function publish() {
		setPublishing(true);
		let imageUrl;

		if (imageData) {
			imageUrl = await uploadImage(imageData);
		}

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
					parentId: data.parentId,
					image: imageUrl,
				}),
			});

			if (response.ok) {
				toast.success('Successfuly Published Category!');
				mutateCategory();
				router.push(`/site/${subdomain}/categories`);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setPublishing(false);
		}
	}

	async function deleteCategory(categoryId: string) {
		setDeletingCategory(true);

		try {
			const res = await fetch(`/api/category?categoryId=${categoryId}`, {
				method: HttpMethod.DELETE,
			});

			if (res.ok) {
				toast.success(`Category Deleted`);
				setTimeout(() => {
					router.push(`/site/${subdomain}/categories`);
				}, 100);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setDeletingCategory(false);
		}
	}

	const handleImageSelect = async (file) => {
		const imagePreviewSrc = URL.createObjectURL(file);

		setImagePreview(imagePreviewSrc);
		return setImageData(file);
	};

	const generateSlug = () => {
		const title = data.title;
		const slug = getSlug(title);

		if (!categorySlugRef?.current) return;

		return setData({
			...data,
			slug: slug,
		});
	};

	if (isLoading) return <Loader />;

	return (
		<>
			<Layout>
				<Header className="">
					<div className="flex justify-between items-center">
						<h1 className="text-4xl">Edit Category</h1>
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
				</Header>
				<Container className="pb-24">
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
					</div>
					<div className="flex w-full space-x-4">
						<div className="flex flex-col w-full">
							<p>
								Slug<span className="text-red-600">*</span>
							</p>
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
						</div>
						<div className="flex flex-col w-full">
							<p>Parent Category</p>
							<div className="border border-gray-700 rounded overflow-hidden w-full flex items-center max-w-lg">
								<select
									onChange={(e) =>
										setData((data) => ({
											...data,
											parentId: (e.target as HTMLSelectElement).value,
										}))
									}
									value={data?.parentId || category?.parentId || ''}
									className="w-full px-5 py-3  text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none placeholder-gray-400"
								>
									<option value="">None</option>
									{categories &&
										categories?.map((category) => {
											if (category.id === categoryId) return;
											return (
												<option value={category.id} key={category.id}>
													{category.title}
												</option>
											);
										})}
								</select>
							</div>
						</div>
					</div>
					<div>
						<p className="mt-8">
							Description<span className="text-red-600">*</span>
						</p>
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
								<Image
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
							</div>
						</div>
						<div className="w-full h-full">
							<h2 className="text-2xl">Meta</h2>
							<div className="w-full border rounded my-auto"></div>
						</div>
					</div>
					<div className="space-y-2 w-full mt-4">
						<h2 className="text-2xl">Delete Category</h2>
						<p>
							Permanently delete the &quot;{data.title}&quot; category and all
							of its contents. This will also remove all the corresponding
							posts. This action is not reversible – please continue with
							caution.
						</p>
						<button
							onClick={() => {
								setShowDeleteModal(true);
							}}
							className="bg-red-500 text-white border-red-500 hover:text-red-500 hover:bg-white px-5 py-3 max-w-max  border-solid border rounded focus:outline-none transition-all ease-in-out duration-150"
						>
							Delete Category
						</button>
					</div>
				</Container>
				<footer className="h-20 z-5 fixed bottom-0 inset-x-0 border-solid border-t border-gray-500 bg-white">
					<div className="max-w-screen-xl mx-auto px-10 sm:px-20 h-full flex justify-between items-center">
						<p>
							{disabled &&
								!publishing &&
								'Category must have a title, description, and a slug to be published.'}
						</p>
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
							className={`ml-auto ${
								disabled
									? 'cursor-not-allowed bg-gray-300 border-gray-300'
									: 'bg-black hover:bg-white hover:text-black border-black'
							} mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
						>
							{publishing ? <LoadingDots /> : 'Publish  →'}
						</button>
					</div>
				</footer>
				<Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
					<form
						onSubmit={async (event) => {
							event.preventDefault();
							await deleteCategory(data?.id as string);
						}}
						className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded"
					>
						<h2 className=" text-2xl mb-6">Delete Category</h2>
						<div className="grid gap-y-4 w-5/6 mx-auto">
							<p className="text-gray-600 mb-3">
								Are you sure you want to delete your category:{' '}
								<b>{data.title}</b>? This action is not reversible. Type in{' '}
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
								disabled={deletingCategory}
								className={`${
									deletingCategory
										? 'cursor-not-allowed text-gray-400 bg-gray-50'
										: 'bg-white text-gray-600 hover:text-black'
								} w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
							>
								{deletingCategory ? <LoadingDots /> : 'DELETE CATEGORY'}
							</button>
						</div>
					</form>
				</Modal>
			</Layout>
		</>
	);
}
