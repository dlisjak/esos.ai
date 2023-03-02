import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/app/Layout';
import Modal from '@/components/Modal';
import LoadingDots from '@/components/app/loading-dots';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Site } from '@prisma/client';

export default function AppIndex() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [creatingSite, setCreatingSite] = useState<boolean>(false);
	const [subdomain, setSubdomain] = useState<string>('');
	const [debouncedSubdomain] = useDebounce(subdomain, 1500);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const siteNameRef = useRef<HTMLInputElement | null>(null);
	const siteSubdomainRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		async function checkSubDomain() {
			if (debouncedSubdomain.length > 0) {
				const response = await fetch(
					`/api/domain/check?domain=${debouncedSubdomain}&subdomain=1`
				);
				const available = await response.json();
				if (available) {
					setError(null);
				} else {
					setError(
						`${debouncedSubdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`
					);
				}
			}
		}
		checkSubDomain();
	}, [debouncedSubdomain]);

	const { data: session } = useSession();
	const sessionId = session?.user?.id;

	const { data: sites } = useSWR<Array<Site>>(
		sessionId && `/api/site`,
		fetcher
	);

	async function createSite() {
		setCreatingSite(true);
		const res = await fetch('/api/site', {
			method: HttpMethod.POST,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: sessionId,
				name: siteNameRef.current?.value,
				subdomain: siteSubdomainRef.current?.value,
			}),
		});

		if (!res.ok) {
			alert('Failed to create site');
		}

		const data = await res.json();
		router.push(`/site/${data.subdomain}/settings`);
		setCreatingSite(false);
	}

	return (
		<Layout>
			<div className="p-4 max-w-screen-xl mx-auto px-10">
				<div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
					<h1 className="text-5xl mr-4 mb-2">Dashboard</h1>
					<button
						onClick={() => setShowModal(true)}
						className="text-lg tracking-wide text-white rounded bg-[#007FFF] px-5 py-3 transition-all ease-in-out duration-150"
					>
						Add New Site <span className="ml-2">＋</span>
					</button>
				</div>
				<div className="my-10 grid gap-y-4">
					{sites && sites.length > 0 ? (
						sites.map((site) => (
							<div key={site.subdomain}>
								<div className="flex flex-col rounded overflow-hidden">
									<div className="relative w-full flex items-end py-2 border-b border-gray-200">
										<Link href={`/site/${site.subdomain}`}>
											<h2 className="text-3xl mr-4 hover:underline">
												{site.name}
											</h2>
										</Link>
										<Link
											href={`/site/${site.subdomain}/posts`}
											className="text-[#007FFF] hover:underline mx-2"
										>
											Posts
										</Link>
										<Link
											href={`/site/${site.subdomain}/categories`}
											className="text-[#007FFF] hover:underline mx-2"
										>
											Categories
										</Link>
										<Link
											href={`/site/${site.subdomain}/themes`}
											className="text-[#007FFF] hover:underline mx-2"
										>
											Themes
										</Link>
										<Link
											href={`/site/${site.subdomain}/code`}
											className="text-[#007FFF] hover:underline mx-2"
										>
											Custom Code
										</Link>
										<Link
											href={`/site/${site.subdomain}/settings`}
											className="ml-auto hover:underline"
										>
											Edit Settings
										</Link>
									</div>
									<div className="flex pt-2 w-auto">
										<Link
											className="px-4 py-2 text-sm flex items-center w-auto tracking-wide rounded bg-black text-white whitespace-nowrap"
											href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${site.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`}
											onClick={(e) => e.stopPropagation()}
											rel="noreferrer"
											target="_blank"
										>
											{site.subdomain}.{process.env.NEXT_PUBLIC_DOMAIN_URL} ↗
										</Link>
									</div>
								</div>
							</div>
						))
					) : (
						<>
							<div className="text-center">
								<p className="text-2xl  text-gray-600">
									No sites yet. Click &quot;New Site&quot; to create one.
								</p>
							</div>
						</>
					)}
				</div>
			</div>

			<Modal showModal={showModal} setShowModal={setShowModal}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						createSite();
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded-lg"
				>
					<h2 className=" text-2xl mb-6">Create a New Site</h2>
					<div className="grid gap-y-4 w-5/6 mx-auto">
						<div className="border border-gray-700 rounded-lg flex flex-start items-center">
							<span className="pl-5 pr-1">📌</span>
							<input
								className="w-full px-5 py-3 text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none rounded-r-lg placeholder-gray-400"
								name="name"
								required
								placeholder="Name"
								ref={siteNameRef}
								type="text"
							/>
						</div>
						<div className="border border-gray-700 rounded-lg flex flex-start items-center">
							<span className="pl-5 pr-1">🪧</span>
							<input
								className="w-full px-5 py-3 text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none rounded-l-lg placeholder-gray-400"
								name="subdomain"
								onInput={() => setSubdomain(siteSubdomainRef.current!.value)}
								placeholder="Subdomain"
								ref={siteSubdomainRef}
								type="text"
							/>
							<span className="px-5 bg-gray-100 h-full flex items-center rounded-r-lg border-l border-gray-600">
								.{process.env.NEXT_PUBLIC_DOMAIN_URL}
							</span>
						</div>
						{error && (
							<p className="px-5 text-left text-red-500">
								<b>{error}</b> is not available. Please choose another
								subdomain.
							</p>
						)}
					</div>
					<div className="flex justify-between items-center mt-10 w-full">
						<button
							type="button"
							className="w-full px-5 py-5 text-sm text-gray-600 hover:text-black border-t border-gray-300 rounded-bl focus:outline-none focus:ring-0 transition-all ease-in-out duration-150"
							onClick={() => {
								setError(null);
								setShowModal(false);
							}}
						>
							CANCEL
						</button>

						<button
							type="submit"
							disabled={creatingSite || error !== null}
							className={`${
								creatingSite || error
									? 'cursor-not-allowed text-gray-400 bg-gray-50'
									: 'bg-white text-gray-600 hover:text-black'
							} w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
						>
							{creatingSite ? <LoadingDots /> : 'CREATE SITE'}
						</button>
					</div>
				</form>
			</Modal>
		</Layout>
	);
}
