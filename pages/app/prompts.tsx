import { useRef, useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { toast, Toaster } from 'react-hot-toast';
import type { Prompt } from '@prisma/client';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';
import PromptCard from '@/components/app/PromptCard';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';

export default function Prompts() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [creatingPrompt, setCreatingPrompt] = useState(false);
	const promptNameRef = useRef<HTMLInputElement | null>(null);
	const promptDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
	const promptCommandRef = useRef<HTMLTextAreaElement | null>(null);

	const { data: session } = useSession();
	const sessionId = session?.user?.id;

	const { data: prompts } = useSWR<Array<Prompt>>(
		sessionId && '/api/prompt',
		fetcher
	);

	async function createPrompt() {
		setCreatingPrompt(true);
		if (!promptNameRef.current || !promptCommandRef.current) return;
		const name = promptNameRef.current.value;
		const command = promptCommandRef.current.value;

		let description = '';
		if (promptDescriptionRef.current) {
			description = promptDescriptionRef.current.value;
		}

		const data = { name, description, command };

		try {
			const res = await fetch(`/api/prompt`, {
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (res.ok) {
				const data = await res.json();
				toast.success('Prompt Created');
			}
		} catch (error) {
			console.error(error);
		} finally {
			setCreatingPrompt(false);
			setShowModal(false);
		}
	}

	return (
		<Layout>
			<Header>
				<div className="flex justify-between items-center">
					<h1 className="text-4xl">Prompts</h1>
					<button
						onClick={() => setShowModal(true)}
						className="text-md tracking-wide text-white rounded bg-black border border-black px-4 py-2 transition-all ease-in-out duration-200 hover:bg-white hover:text-black"
					>
						New Prompt <span className="ml-2">＋</span>
					</button>
				</div>
			</Header>
			<Container>
				<div className="my-4 grid gap-y-4">
					{prompts && prompts.length > 0 ? (
						prompts?.map((prompt) => (
							<PromptCard prompt={prompt} key={prompt.id} />
						))
					) : (
						<>
							<div className="text-center">
								<p className="text-2xl text-gray-600">
									No prompts yet. Click &quot;New Prompt&quot; to create one.
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
						createPrompt();
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded"
				>
					<div className="px-8">
						<h2 className="text-2xl mb-6">Create a New Prompt</h2>
						<div className="flex flex-col space-y-4 flex-start items-center">
							<div className="flex flex-col w-full">
								<label className="text-start mb-1" htmlFor="name">
									Prompt Name <span className="text-red-500">*</span>
								</label>
								<input
									id="name"
									className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
									name="name"
									required
									placeholder="Awesome Writer for Blog Post"
									ref={promptNameRef}
									type="text"
								/>
							</div>
							<div className="flex flex-col w-full">
								<label className="text-start mb-1" htmlFor="name">
									Prompt Description
								</label>
								<textarea
									className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
									name="description"
									required
									placeholder="To Help Write a Long Form Blog Post in the Style of..."
									ref={promptDescriptionRef}
								/>
							</div>
							<div className="flex flex-col w-full">
								<label className="text-start mb-1" htmlFor="name">
									Prompt Command <span className="text-red-500">*</span>
								</label>
								<textarea
									className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
									name="command"
									required
									placeholder="I want you to act as a professional copywriter..."
									rows={8}
									ref={promptCommandRef}
								/>
							</div>
						</div>
					</div>
					<div className="flex justify-between items-center mt-10 w-full">
						<button
							type="button"
							className="w-full px-5 py-5 text-sm text-gray-600 hover:text-black border-t border-gray-300 rounded-bl focus:outline-none focus:ring-0 transition-all ease-in-out duration-200"
							onClick={() => {
								setShowModal(false);
							}}
						>
							CANCEL
						</button>

						<button
							type="submit"
							disabled={creatingPrompt}
							className={`${
								creatingPrompt
									? 'cursor-not-allowed text-gray-400 bg-gray-50'
									: 'bg-white text-gray-600 hover:text-black'
							} w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-200`}
						>
							{creatingPrompt ? <LoadingDots /> : 'CREATE PROMPT'}
						</button>
					</div>
				</form>
			</Modal>
		</Layout>
	);
}
