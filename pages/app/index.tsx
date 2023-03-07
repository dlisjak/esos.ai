import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/app/Layout';
import Modal from '@/components/Modal';
import LoadingDots from '@/components/app/loading-dots';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useDebounce } from 'use-debounce';
import { HttpMethod } from '@/types';

import SiteCard from '@/components/app/SiteCard';
import AddNewButton from '@/components/app/AddNewButton';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';
import { useSites } from '@/lib/queries';
import Loader from '@/components/app/Loader';

export default function AppIndex() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [creatingSite, setCreatingSite] = useState<boolean>(false);
	const [subdomain, setSubdomain] = useState<string>('');
	const [debouncedSubdomain] = useDebounce(subdomain, 1500);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const siteNameRef = useRef<HTMLInputElement | null>(null);
	const siteSubdomainRef = useRef<HTMLInputElement | null>(null);

	const { data: session } = useSession();
	const sessionId = session?.user?.id;

	const { sites, isLoading } = useSites();

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

	if (isLoading) return <Loader />;

	return (
		<Layout>
			<Header>
				<div className="flex justify-between items-center">
					<h1 className="text-4xl">Dashboard</h1>
					<AddNewButton onClick={() => setShowModal(true)}>
						Add Site <span className="ml-2">＋</span>
					</AddNewButton>
				</div>
			</Header>
			<Container dark>
				<div className="grid gap-y-4">
					{sites && sites.length > 0 ? (
						sites.map((site) => <SiteCard site={site} key={site.id} />)
					) : (
						<>
							<div className="text-center">
								<p className="text-2xl my-4 text-gray-600">
									No sites yet. Click &quot;Add Site&quot; to create one.
								</p>
							</div>
						</>
					)}
				</div>
			</Container>

			<Modal showModal={showModal} setShowModal={setShowModal}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						createSite();
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded"
				>
					<h2 className="text-2xl mb-6">Create a New Site</h2>
					<div className="grid gap-y-4 w-5/6 mx-auto">
						<div className="border border-gray-700 rounded flex flex-start items-center">
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
						<div className="border border-gray-700 rounded flex flex-start items-center">
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
