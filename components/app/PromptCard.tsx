import Link from 'next/link';

import LoadingDots from './loading-dots';
import { StatusIndicator } from './PostCard';

const PromptCard = ({ prompt, testOnClick, testingPrompt }) => {
	if (!prompt) return <></>;

	const promptEditUrl = `/prompts/${prompt.id}`;

	return (
		<div className="relative bg-white p-4 flex items-end rounded drop-shadow-sm">
			<div className="w-full flex rounded overflow-hidden h-full">
				<div className="flex flex-col w-full">
					<div className="flex flex-col relative">
						<div className="flex flex-col items-start">
							<Link href={promptEditUrl} className="hover:underline">
								<h2 className="text-xl font-semibold mb-1">{prompt.name}</h2>
							</Link>
						</div>
						<p className="line-clamp-3 break-words">{prompt.description}</p>
					</div>
					<div className="flex flex-col mt-auto items-end">
						<div className="flex h-full space-x-2 items-end justify-between">
							<Link
								className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
								href={promptEditUrl}
							>
								Edit
							</Link>
							<button
								className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap h-full items-center"
								onClick={() => testOnClick(prompt.id, prompt.command)}
								disabled={testingPrompt}
							>
								{testingPrompt ? <LoadingDots /> : 'Test'}
							</button>
						</div>
					</div>
				</div>
			</div>
			<StatusIndicator published={prompt.tested} right />
		</div>
	);
};

export default PromptCard;
