import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';

import { HttpMethod } from '@/types';
import PromptCard from '@/components/app/PromptCard';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';
import AddNewButton from '@/components/app/AddNewButton';
import { usePrompts } from '@/lib/queries';
import Loader from '@/components/app/Loader';

export default function Prompts() {
	const [showCreatePostModal, setShowCreatePromptModal] =
		useState<boolean>(false);
	const [creatingPrompt, setCreatingPrompt] = useState(false);
	const [testingPrompt, setTestingPrompt] = useState(false);
	const promptNameRef = useRef<HTMLInputElement | null>(null);
	const promptDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
	const promptCommandRef = useRef<HTMLTextAreaElement | null>(null);
	const promptHintRef = useRef<HTMLInputElement | null>(null);

	const { prompts, isLoading, mutatePrompts } = usePrompts();

	async function testPrompt(promptId, command) {
		setTestingPrompt(true);
		const data = { command };

		try {
			const res = await fetch(`/api/prompt/test?promptId=${promptId}`, {
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (res.ok) {
				mutatePrompts();
				toast.success(`Prompt Works!`);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setTestingPrompt(false);
		}
	}

	async function createPrompt() {
		setCreatingPrompt(true);
		if (!promptNameRef.current || !promptCommandRef.current) return;
		const name = promptNameRef.current.value;
		const command = promptCommandRef.current.value;

		let description = '';
		if (promptDescriptionRef.current) {
			description = promptDescriptionRef.current.value;
		}
		let hint = '';
		if (promptHintRef.current) {
			hint = promptHintRef.current.value;
		}

		const data = { name, description, command, hint };

		try {
			const res = await fetch(`/api/prompt`, {
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (res.ok) {
				mutatePrompts();
				toast.success('Prompt Created');
			}
		} catch (error) {
			console.error(error);
		} finally {
			setCreatingPrompt(false);
			setShowCreatePromptModal(false);
		}
	}

	if (isLoading) return <Loader />;

	return (
		<Layout>
			<Header>
				<div className="flex justify-between items-center">
					<h1 className="text-4xl">Prompts</h1>
					<div className="flex space-x-4">
						<AddNewButton onClick={() => setShowCreatePromptModal(true)}>
							Add Prompt <span className="ml-2">＋</span>
						</AddNewButton>
					</div>
				</div>
			</Header>
			<Container dark>
				{prompts && prompts.length > 0 ? (
					<div className="grid grid-cols-3 gap-x-4 gap-y-4">
						{prompts?.map((prompt) => (
							<PromptCard
								prompt={prompt}
								testOnClick={testPrompt}
								testingPrompt={testingPrompt}
								key={prompt.id}
							/>
						))}
					</div>
				) : (
					<>
						<div className="text-center">
							<p className="text-2xl my-4 text-gray-600">
								No Prompts added. Click &quot;Add Prompt&quot; to add one.
							</p>
						</div>
					</>
				)}
			</Container>
			<Modal
				showModal={showCreatePostModal}
				setShowModal={setShowCreatePromptModal}
			>
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
									placeholder="Prompt command including placeholders such as [KEYWORD] or [TITLE], these will be replaced automatically"
									rows={8}
									ref={promptCommandRef}
								/>
							</div>
							<div className="flex flex-col w-full">
								<label className="text-start mb-1" htmlFor="name">
									Prompt Hint
								</label>
								<input
									className="w-full px-5 py-3 text-gray-700 bg-white rounded placeholder-gray-400"
									name="hint"
									required
									placeholder="[TITLE] or [KEYWORD]"
									type="text"
									ref={promptHintRef}
								/>
							</div>
						</div>
					</div>
					<div className="flex justify-between items-center mt-10 w-full">
						<button
							type="button"
							className="w-full px-5 py-5 text-sm text-gray-600 hover:text-black border-t border-gray-300 rounded-bl focus:outline-none focus:ring-0 transition-all ease-in-out duration-200"
							onClick={() => {
								setShowCreatePromptModal(false);
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
