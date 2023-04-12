import Link from "next/link";

import LoadingDots from "./loading-dots";
import { StatusIndicator } from "./PostCard";

const PromptCard = ({ prompt, testOnClick, testingPrompt }: any) => {
  if (!prompt) return <></>;

  const promptEditUrl = `/prompts/${prompt.id}`;
  const tested = prompt.tested;

  return (
    <div className="relative flex items-end rounded bg-white p-4 drop-shadow-sm">
      <div className="flex h-full w-full overflow-hidden rounded">
        <div className="flex w-full flex-col">
          <div className="relative flex flex-col">
            <div className="flex flex-col items-start">
              <Link href={promptEditUrl} className="hover:underline">
                <h2 className="mb-1 text-xl font-semibold">{prompt.name}</h2>
              </Link>
            </div>
            <p className="break-words line-clamp-3">{prompt.description}</p>
          </div>
          <div className="mt-auto flex flex-col items-end">
            <div className="flex h-full items-end justify-between space-x-2">
              <Link
                className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
                href={promptEditUrl}
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>
      <StatusIndicator published={prompt.tested} right />
    </div>
  );
};

export default PromptCard;
