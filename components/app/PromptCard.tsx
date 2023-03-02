import Link from 'next/link';
import BlurImage from '../BlurImage';
import { StatusIndicator } from './PostCard';

const PromptCard = ({ prompt }) => {
	if (!prompt) return <></>;

	const promptEditUrl = `/site/prompts/${prompt.id}`;
	const promptTestUrl = `/site/prompts/${prompt.id}/test`;

	return (
		<div className="relative bg-white p-4 flex items-end rounded drop-shadow-sm">
			<div className="w-full flex rounded overflow-hidden">
				<div className="relative h-[120px]">
					<Link href={promptEditUrl}>
						{prompt.image ? (
							<BlurImage
								alt={prompt.title ?? 'Unknown Thumbnail'}
								width={240}
								height={120}
								className="h-full object-cover"
								src={prompt.image}
							/>
						) : (
							<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-3xl">
								?
							</div>
						)}
					</Link>
				</div>
				<div className="flex flex-col relative px-4">
					<div className="flex flex-col items-start">
						<Link href={promptEditUrl} className="hover:underline">
							<h2 className="text-xl font-semibold mb-1">{prompt.name}</h2>
						</Link>
						<p>{prompt.description}</p>
					</div>
				</div>
			</div>
			<div className="flex flex-col h-full items-end">
				<div className="flex h-full space-x-2 items-end justify-between">
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={promptEditUrl}
					>
						Edit
					</Link>
					<Link
						className="flex px-3 py-1 tracking-wide rounded text-black bg-white border duration-200 hover:border-black whitespace-nowrap"
						href={promptTestUrl}
					>
						Test
					</Link>
				</div>
			</div>
			<StatusIndicator published={prompt.command} className="top-2 left-2" />
		</div>
	);
};

export default PromptCard;
