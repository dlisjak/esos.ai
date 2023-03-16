import Link from "next/link";

import { StatusIndicator } from "./PostCard";

const SlimPostCard = ({ post, editUrl = "" }) => {
  if (!post) return <></>;

  return (
    <li className="relative flex items-center justify-between bg-white py-2 pr-2 pl-4">
      <StatusIndicator published={post.published} className="top-6 left-0" />
      <div className="ml-4 flex flex-col items-start justify-center">
        <h3 className="text-xl font-semibold line-clamp-1">{post.title}</h3>
        <p className="right-1 flex w-auto rounded bg-gray-100 px-1 text-xs line-clamp-1">
          /{post.slug}
        </p>
      </div>
      <div className="flex h-full flex-col items-end">
        <div className="relative flex justify-between"></div>
        <div className="ml-2 flex h-full items-end justify-between space-x-2">
          {editUrl && (
            <Link
              className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
              href={editUrl}
            >
              Edit
            </Link>
          )}
        </div>
      </div>
    </li>
  );
};

export default SlimPostCard;
