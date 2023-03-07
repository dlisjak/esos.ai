import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { useS3Upload } from 'next-s3-upload';

import BlurImage from '@/components/BlurImage';
import CloudinaryUploadWidget from '@/components/Cloudinary';
import DomainCard from '@/components/app/DomainCard';
import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Site } from '@prisma/client';
import { Theme } from '@prisma/client';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';
import { useSession } from 'next-auth/react';

interface SettingsData
	extends Pick<
		Site,
		| 'id'
		| 'name'
		| 'font'
		| 'subdomain'
		| 'customDomain'
		| 'image'
		| 'imageBlurhash'
		| 'themeId'
	> {}

export default function SiteSettings() {
	const router = useRouter();
	const { data: session } = useSession();
	const [saving, setSaving] = useState(false);
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState<any | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingSite, setDeletingSite] = useState(false);
	const [imagePreview, setImagePreview] = useState<any>();
	const [imageData, setImageData] = useState<any>();
	const { FileInput, uploadToS3 } = useS3Upload();

	const { subdomain } = router.query;
	const sessionUser = session?.user?.name;

	const { data: settings } = useSWR<Site | null>(
		subdomain && `/api/site?subdomain=${subdomain}`,
		fetcher,
		{
			onError: () => router.push('/'),
			revalidateOnFocus: false,
		}
	);

	const { data: themes } = useSWR<Theme[] | null>(
		subdomain && `/api/theme`,
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	const [data, setData] = useState<SettingsData>({
		id: '',
		name: null,
		font: '',
		subdomain: null,
		customDomain: null,
		image: null,
		imageBlurhash: null,
		themeId: '',
	});

	useEffect(() => {
		if (settings) setData(settings);
	}, [settings]);

	async function saveSiteSettings(data: SettingsData) {
		setSaving(true);

		let imageUrl;

		if (imageData) {
			imageUrl = await uploadImage(imageData);
		}

		try {
			const res = await fetch('/api/site', {
				method: HttpMethod.PUT,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					currentSubdomain: settings?.subdomain ?? undefined,
					...data,
					id: data.id,
					image: imageUrl,
				}),
			});

			if (res.ok) {
				const data = await res.json();
				mutate(`/api/site?subdomain=${settings?.subdomain}`);
				mutate(`/api/site?subdomain=${data?.subdomain}`);
				toast.success(`Changes Saved`);
			}
		} catch (error) {
			toast.error('Failed to save settings');
			console.error(error);
		} finally {
			setSaving(false);
		}
	}

	async function deleteSite(siteId: string) {
		setDeletingSite(true);

		try {
			const response = await fetch(`/api/site?siteId=${siteId}`, {
				method: HttpMethod.DELETE,
			});

			if (response.ok) router.push('/');
		} catch (error) {
			console.error(error);
		} finally {
			setDeletingSite(false);
		}
	}
	const [debouncedSubdomain] = useDebounce(data?.subdomain, 1500);
	const [subdomainError, setSubdomainError] = useState<string | null>(null);

	useEffect(() => {
		async function checkSubdomain() {
			try {
				const response = await fetch(
					`/api/domain/check?domain=${debouncedSubdomain}&subdomain=1`
				);

				const available = await response.json();

				setSubdomainError(
					available
						? null
						: `${debouncedSubdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`
				);
			} catch (error) {
				console.error(error);
			}
		}

		if (
			debouncedSubdomain !== settings?.subdomain &&
			debouncedSubdomain &&
			debouncedSubdomain?.length > 0
		)
			checkSubdomain();
	}, [debouncedSubdomain, settings?.subdomain]);

	async function handleCustomDomain() {
		const customDomain = data.customDomain;

		setAdding(true);

		try {
			const response = await fetch(
				`/api/domain?domain=${customDomain}&subdomain=${subdomain}`,
				{
					method: HttpMethod.POST,
				}
			);

			if (!response.ok)
				throw {
					code: response.status,
					domain: customDomain,
				};
			setError(null);
			mutate(`/api/site?subdomain=${subdomain}`);
		} catch (error) {
			setError(error);
		} finally {
			setAdding(false);
		}
	}

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

	const handleImageSelect = async (file) => {
		const imagePreviewSrc = URL.createObjectURL(file);

		setImagePreview(imagePreviewSrc);
		return setImageData(file);
	};

	return (
		<Layout>
			<Header>
				<h1 className="text-4xl">Site Settings</h1>
			</Header>
			<Container className="pb-24">
				<div className="my-4 flex flex-col space-y-4">
					<div className="flex w-full  space-x-8">
						<div className="flex flex-col space-y-2 w-full">
							<h2 className=" text-2xl">Name</h2>
							<div className="border border-gray-700 rounded overflow-hidden flex items-center max-w-lg">
								<input
									className="w-full px-5 py-3  text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none placeholder-gray-400"
									name="name"
									onInput={(e) =>
										setData((data) => ({
											...data,
											name: (e.target as HTMLTextAreaElement).value,
										}))
									}
									placeholder="Untitled Site"
									type="text"
									value={data.name || ''}
								/>
							</div>
						</div>
						<div className="flex flex-col space-y-2 w-full">
							<h2 className="text-2xl">Font</h2>
							<div className="border border-gray-700 rounded overflow-hidden w-full flex items-center max-w-lg">
								<select
									onChange={(e) =>
										setData((data) => ({
											...data,
											font: (e.target as HTMLSelectElement).value,
										}))
									}
									value={data?.font || ''}
									className="w-full px-5 py-3  text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none placeholder-gray-400"
								>
									<option value="">Cal Sans</option>
									<option value="font-lora">Lora</option>
									<option value="font-work">Work Sans</option>
								</select>
							</div>
						</div>
					</div>
					<div className="flex w-full  space-x-8">
						<div className="flex flex-col space-y-2 w-full">
							<h2 className=" text-2xl">Subdomain</h2>
							<div className="border border-gray-700 rounded flex items-center max-w-lg">
								<input
									className="w-1/2 px-5 py-3  text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none rounded-l-lg placeholder-gray-400"
									name="subdomain"
									onInput={(e) =>
										setData((data) => ({
											...data,
											subdomain: (e.target as HTMLTextAreaElement).value,
										}))
									}
									placeholder="subdomain"
									type="text"
									value={data.subdomain || ''}
								/>
								<div className="w-1/2 h-12 flex justify-center items-center  rounded-r-lg border-l border-gray-600 bg-gray-100">
									{process.env.NEXT_PUBLIC_DOMAIN_URL}
								</div>
							</div>
							{data.subdomain !== subdomain && subdomainError && (
								<p className="px-5 text-left text-red-500">
									<b>{subdomainError}</b> is not available. Please choose
									another subdomain.
								</p>
							)}
						</div>
						<div className="flex flex-col space-y-2 w-full">
							<h2 className=" text-2xl">Custom Domain</h2>
							{settings?.customDomain ? (
								<DomainCard data={data} />
							) : (
								<form
									onSubmit={async (e) => {
										e.preventDefault();
										await handleCustomDomain();
									}}
									className="flex justify-start items-center space-x-3 max-w-lg"
								>
									<div className="border border-gray-700 flex-auto rounded overflow-hidden">
										<input
											autoComplete="off"
											className="w-full px-5 py-3  text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none placeholder-gray-400"
											name="customDomain"
											onInput={(e) => {
												setData((data) => ({
													...data,
													customDomain: (e.target as HTMLTextAreaElement).value,
												}));
											}}
											pattern="^(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$"
											placeholder="mydomain.com"
											value={data.customDomain || ''}
											type="text"
										/>
									</div>
									<button
										type="submit"
										className="bg-black text-white border-black hover:text-black hover:bg-white px-5 py-3 w-28  border-solid border rounded focus:outline-none transition-all ease-in-out duration-150"
									>
										{adding ? <LoadingDots /> : 'Add'}
									</button>
								</form>
							)}
							{error && (
								<div className="text-red-500 text-left w-full max-w-2xl mt-5 text-sm flex items-center space-x-2">
									<svg
										viewBox="0 0 24 24"
										width="20"
										height="20"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										fill="none"
										shapeRendering="geometricPrecision"
										style={{ color: '#f44336' }}
									>
										<circle cx="12" cy="12" r="10" fill="white" />
										<path d="M12 8v4" stroke="#f44336" />
										<path d="M12 16h.01" stroke="#f44336" />
									</svg>
									{error.code == 403 ? (
										<p>
											<b>{error.domain}</b> is already owned by another team.
											<button
												className="ml-1"
												onClick={async (e) => {
													e.preventDefault();
													await fetch(
														`/api/request-delegation?domain=${error.domain}`
													).then((res) => {
														if (res.ok) {
															toast.success(
																`Requested delegation for ${error.domain}. Try adding the domain again in a few minutes.`
															);
														} else {
															alert(
																'There was an error requesting delegation. Please try again later.'
															);
														}
													});
												}}
											>
												<u>Click here to request access.</u>
											</button>
										</p>
									) : (
										<p>
											Cannot add <b>{error.domain}</b> since it&apos;s already
											assigned to another project.
										</p>
									)}
								</div>
							)}
						</div>
					</div>
					<div className="flex w-full space-x-8">
						<div className="w-full">
							<div className="flex flex-col space-y-2 relative w-full max-w-lg">
								<h2 className="text-2xl">Logo Image</h2>
								<div className="w-full max-w-lg">
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
												blurDataURL={imagePreview || data.image}
											/>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-col justify-between w-full">
							<div className="flex flex-col w-full mb-auto">
								<h2 className="text-2xl">Theme</h2>
								<div className="border border-gray-700 rounded overflow-hidden w-full flex items-center max-w-lg">
									<select
										onChange={(e) =>
											setData((data) => ({
												...data,
												themeId: (e.target as HTMLSelectElement).value,
											}))
										}
										value={data?.themeId || ''}
										className="w-full px-5 py-3  text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none placeholder-gray-400"
									>
										<option value="" disabled>
											Select a Theme
										</option>
										{themes?.map((theme) => (
											<option value={theme.id} key={theme.id}>
												{theme.name}
											</option>
										))}
									</select>
								</div>
							</div>
							<div className="flex flex-col space-y-2 w-full">
								<h2 className="text-2xl">Delete Site</h2>
								<p>
									Permanently delete your site and all of its contents from our
									platform. This action is not reversible – please continue with
									caution.
								</p>
								<button
									onClick={() => {
										setShowDeleteModal(true);
									}}
									className="bg-red-500 text-white border-red-500 hover:text-red-500 hover:bg-white px-5 py-3 max-w-max  border-solid border rounded focus:outline-none transition-all ease-in-out duration-150"
								>
									Delete Site
								</button>
							</div>
						</div>
					</div>
				</div>
			</Container>
			<Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						await deleteSite(data?.id as string);
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded"
				>
					<h2 className=" text-2xl mb-6">Delete Site</h2>
					<div className="grid gap-y-4 w-5/6 mx-auto">
						<p className="text-gray-600 mb-3">
							Are you sure you want to delete your site? This action is not
							reversible. Type in the full name of your site (<b>{data.name}</b>
							) to confirm.
						</p>
						<div className="border border-gray-700 rounded flex flex-start items-center overflow-hidden">
							<input
								className="w-full px-5 py-3 text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none rounded-r-lg placeholder-gray-400"
								type="text"
								name="name"
								placeholder={data.name ?? ''}
								pattern={data.name ?? 'Site Name'}
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
							disabled={deletingSite}
							className={`${
								deletingSite
									? 'cursor-not-allowed text-gray-400 bg-gray-50'
									: 'bg-white text-gray-600 hover:text-black'
							} w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
						>
							{deletingSite ? <LoadingDots /> : 'DELETE SITE'}
						</button>
					</div>
				</form>
			</Modal>

			<footer className="h-20 z-20 fixed bottom-0 inset-x-0 border-solid border-t border-gray-500 bg-white">
				<div className="max-w-screen-lg mx-auto h-full flex justify-end items-center">
					<button
						onClick={() => {
							saveSiteSettings(data);
						}}
						disabled={saving || subdomainError !== null}
						className={`${
							saving || subdomainError
								? 'cursor-not-allowed bg-gray-300 border-gray-300'
								: 'bg-black hover:bg-white hover:text-black border-black'
						} mx-2 rounded w-36 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
					>
						{saving ? <LoadingDots /> : 'Save Changes'}
					</button>
				</div>
			</footer>
		</Layout>
	);
}
