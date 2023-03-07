import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Prompt } from '@prisma/client';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';

import { HttpMethod } from '@/types';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';
import { useRouter } from 'next/router';
import { usePrompt } from '@/lib/queries';
import Loader from '@/components/app/Loader';
import Modal from '@/components/Modal';

export default function Prompt() {
	const router = useRouter();
	const { promptId } = router.query;
	const [saving, setSaving] = useState(false);
	const [testing, setTesting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [promptName, setPromptName] = useState('');
	const [promptDescription, setPromptDescription] = useState('');
	const [promptCommand, setPromptCommand] = useState('');
	const [promptHint, setPromptHint] = useState('');
	const [promptVariables, setPromptVariables] = useState('');
	const [promptVariablesError, setPromptVariablesError] = useState(false);
	const [promptOutput, setPromptOutput] = useState('');

	const { prompt, isLoading, mutatePrompt } = usePrompt(promptId);

	useEffect(() => {
		setPromptName(prompt?.name ?? '');
		setPromptDescription(prompt?.description ?? '');
		setPromptCommand(prompt?.command ?? '');
		setPromptHint(prompt?.hint ?? '');
	}, [prompt]);

	async function save(exit = false) {
		setSaving(true);

		try {
			const res = await fetch(`/api/prompt?promptId=${promptId}`, {
				method: HttpMethod.PUT,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: promptName,
					description: promptDescription,
					command: promptCommand,
					hint: promptHint,
				}),
			});

			if (res.ok) {
				mutatePrompt();
				if (exit) {
					router.push('/prompts');
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	}

	async function test() {
		setPromptVariablesError(false);
		if (promptHint && !promptVariables) {
			return setPromptVariablesError(true);
		}
		setTesting(true);
		const regex = new RegExp(/\[(.*?)\]/g);

		const command = promptCommand.replaceAll(regex, promptVariables);

		try {
			const res = await fetch(`/api/prompt/test?promptId=${promptId}`, {
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					command,
				}),
			});

			if (res.ok) {
				const data = await res.json();
				setPromptOutput(data.message);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setTesting(false);
		}
	}

	async function deletePrompt() {
		setDeleting(true);

		try {
			const res = await fetch(`/api/prompt?promptId=${promptId}`, {
				method: HttpMethod.DELETE,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (res.ok) {
				mutatePrompt();
				router.push('/prompts');
				toast.success('Prompt deleted');
			}
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	}

	if (isLoading) return <Loader />;

	return (
		<Layout>
			<Header>
				<div className="flex justify-between items-center">
					<h1 className="text-4xl">{prompt?.name}</h1>
					<button
						onClick={async () => {
							await save(true);
						}}
						title={
							saving
								? 'Category must have a title, description, and a slug to be published.'
								: 'Publish'
						}
						disabled={saving}
						className={`ml-4 ${
							saving
								? 'cursor-not-allowed bg-gray-300 border-gray-300'
								: 'bg-black hover:bg-white hover:text-black border-black'
						} mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
					>
						{saving ? <LoadingDots /> : 'Save & Exit  →'}
					</button>
				</div>
			</Header>
			<Container className="pb-24">
				<div className="grid grid-cols-2 grid-x-4 py-4">
					<div className="flex flex-col pr-4">
						<div className="flex flex-col">
							<label>Prompt Name</label>
							<input
								className="rounded"
								value={promptName || prompt?.name || ''}
								onChange={(e) => setPromptName(e.target.value)}
								type="text"
							/>
						</div>
						<div className="flex flex-col mt-4">
							<label>Prompt Description</label>
							<textarea
								className="rounded"
								value={promptDescription || prompt?.description || ''}
								onChange={(e) => setPromptDescription(e.target.value)}
								rows={2}
							/>
							<div className="flex flex-col mt-4">
								<label>Prompt Hint</label>
								<textarea
									className="rounded"
									value={promptHint || prompt?.hint || ''}
									onChange={(e) => setPromptHint(e.target.value)}
									rows={1}
								/>
							</div>
							<div className="flex flex-col mt-4">
								<label>Prompt Command</label>
								<textarea
									className="rounded"
									value={promptCommand || prompt?.command || ''}
									onChange={(e) => setPromptCommand(e.target.value)}
									rows={16}
								/>
							</div>
						</div>
					</div>
					<div className="flex flex-col pl-4">
						<div className="flex flex-col">
							<label>Prompt Input:</label>
							<input
								style={{ border: promptVariablesError ? '1px solid red' : '' }}
								className="rounded"
								onChange={(e) => setPromptVariables(e.target.value)}
								value={promptVariables}
								placeholder={promptHint}
								type="text"
							/>
						</div>

						<div className="flex flex-col mt-4">
							<label>Output:</label>
							<textarea
								className="rounded"
								value={promptOutput}
								rows={21}
								readOnly
							/>
						</div>
					</div>
				</div>
				<div className="space-y-2 w-full mt-4">
					<h2 className="text-2xl">Delete Prompt</h2>
					<p>
						Permanently delete the &quot;{prompt?.name}&quot; prompt and all
						This action is not reversible – please continue with caution.
					</p>
					<button
						onClick={() => {
							setShowDeleteModal(true);
						}}
						className="bg-red-500 text-white border-red-500 hover:text-red-500 hover:bg-white px-5 py-3 max-w-max  border-solid border rounded focus:outline-none transition-all ease-in-out duration-150"
					>
						Delete Prompt
					</button>
				</div>
			</Container>
			<footer className="h-20 z-5 fixed bottom-0 inset-x-0 border-solid border-t border-gray-500 bg-white">
				<div className="max-w-screen-lg mx-auto h-full flex justify-end items-center">
					<button
						onClick={async () => {
							await save();
						}}
						disabled={saving}
						className={`ml-auto ${
							saving
								? 'cursor-not-allowed bg-gray-300 border-gray-300'
								: 'bg-black hover:bg-white hover:text-black border-black'
						} mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
					>
						{saving ? <LoadingDots /> : 'Save'}
					</button>
					<button
						onClick={async () => {
							await test();
						}}
						disabled={testing}
						className={`ml-4 ${
							testing
								? 'cursor-not-allowed bg-gray-300 border-gray-300'
								: 'bg-black hover:bg-white hover:text-black border-black'
						} mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
					>
						{testing ? <LoadingDots /> : 'Output'}
					</button>
				</div>
			</footer>
			<Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						await deletePrompt();
					}}
					className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded"
				>
					<h2 className=" text-2xl mb-6">Delete Prompt</h2>
					<div className="grid gap-y-4 w-5/6 mx-auto">
						<p className="text-gray-600 mb-3">
							Are you sure you want to delete your prompt: <b>{prompt?.name}</b>
							? This action is not reversible. Type in{' '}
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
							disabled={deleting}
							className={`${
								deleting
									? 'cursor-not-allowed text-gray-400 bg-gray-50'
									: 'bg-white text-gray-600 hover:text-black'
							} w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
						>
							{deleting ? <LoadingDots /> : 'DELETE PROMPT'}
						</button>
					</div>
				</form>
			</Modal>
		</Layout>
	);
}
