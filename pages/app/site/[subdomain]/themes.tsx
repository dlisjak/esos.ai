import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

import BlurImage from '@/components/BlurImage';
import CloudinaryUploadWidget from '@/components/Cloudinary';
import DomainCard from '@/components/app/DomainCard';
import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Site, Theme } from '@prisma/client';

interface ThemeData extends Pick<Site, 'themeId'> {}

export default function SiteThemes() {
	const router = useRouter();
	const { id } = router.query;
	const siteId = id;

	const { data: settings } = useSWR<Site | null>(
		siteId && `/api/site?siteId=${siteId}`,
		fetcher,
		{
			onError: () => router.push('/'),
			revalidateOnFocus: false,
		}
	);

	const { data: themes } = useSWR<Theme[] | null>('/api/theme', fetcher, {
		revalidateOnFocus: false,
	});

	const [saving, setSaving] = useState(false);
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState<any | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingSite, setDeletingSite] = useState(false);

	const [data, setData] = useState<ThemeData>({
		themeId: '',
	});

	useEffect(() => {
		if (settings) setData(settings);
	}, [settings]);

	async function saveSiteSettings(data: ThemeData) {
		setSaving(true);

		try {
			const response = await fetch('/api/site', {
				method: HttpMethod.PUT,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					currentSubdomain: settings?.subdomain ?? undefined,
					...data,
					id: siteId,
				}),
			});

			if (response.ok) {
				setSaving(false);
				mutate(`/api/site?siteId=${siteId}`);
				toast.success(`Changes Saved`);
			}
		} catch (error) {
			toast.error('Failed to save settings');
			console.error(error);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Layout>
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 10000,
				}}
			/>
			<div className="max-w-screen-xl mx-auto px-10 sm:px-20 mt-20 mb-16">
				<h1 className=" text-5xl mb-12">Themes</h1>
				<p>Select a Theme:</p>
				<div className="grid grid-cols-3 gap-4 mt-4">
					{themes?.map((theme) => (
						<div
							className="relative flex items-center min-w-[20rem] justify-center aspect-square border rounded drop-shadow-md  hover:drop-shadow-xl ease-in-out duration-100 bg-white cursor-pointer"
							key={theme.id}
						>
							<div className="absolute bottom-0 left-0 right-0 p-2 border-t text-center">
								{theme.name}
							</div>
						</div>
					))}
					<div className="relative flex items-center min-w-[20rem] justify-center aspect-square	border rounded drop-shadow-md  hover:drop-shadow-xl ease-in-out duration-100 bg-white cursor-pointer">
						<div className="absolute bottom-0 left-0 right-0 p-2 border-t text-center">
							name 2
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
