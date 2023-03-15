import Image from "next/image";
import Link from "next/link";

export const StatusIndicator = ({
  published,
  right = false,
  className = "",
}) => {
  return (
    <div
      className={`${className} absolute top-2 ${
        !right ? "left-2" : "right-2"
      } h-4 w-4 rounded-full ${published ? "bg-emerald-400" : "bg-yellow-400"}`}
    />
  );
};

const PostCard = ({
  subdomain,
  post,
  postEditUrl,
  removePostClick,
  makeFeatured,
}) => {
  if (!post || !postEditUrl) return <></>;

  const { id, image, title, slug, category, isFeatured, published } = post;

  return (
    <div className="relative flex items-end rounded bg-white p-4 drop-shadow-sm">
      <div className="flex w-full overflow-hidden">
        <div className="relative h-[120px]">
          <Link href={postEditUrl}>
            <Image
              alt={image?.alt ?? "Placeholder image"}
              width={240}
              height={120}
              className="h-full object-cover"
              src={image?.src ?? "/placeholder.png"}
            />
          </Link>
        </div>
        <div className="relative flex flex-col px-4">
          <div className="flex items-center">
            <Link href={postEditUrl} className="hover:underline">
              <h2 className="mb-1 text-xl font-semibold">{title}</h2>
            </Link>
          </div>
          <p className="right-1 flex w-auto rounded bg-slate-100 px-1 text-sm line-clamp-1">
            /{slug}
          </p>
          <Link
            href={`/site/${subdomain}/categories/${category?.id}`}
            className="hover:underline"
          >
            <p>{category?.title}</p>
          </Link>
        </div>
      </div>
      <div className="flex h-full flex-col items-end">
        <div className="relative flex justify-between">
          <button
            className="mr-2 flex whitespace-nowrap rounded px-2 py-0 text-2xl font-light tracking-wide text-yellow-500 duration-200"
            onClick={() => makeFeatured(id, !isFeatured)}
          >
            {isFeatured ? "★" : "☆"}
          </button>
          <Link
            className="flex items-center justify-center rounded bg-slate-400 px-2 tracking-wide text-white duration-200 hover:bg-slate-600"
            href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${subdomain}.${
              process.env.NEXT_PUBLIC_DOMAIN_URL
            }${category?.slug ? "/" + category?.slug : ""}/${slug}`}
            onClick={(e) => e.stopPropagation()}
            rel="noreferrer"
            target="_blank"
          >
            ↗
          </Link>
        </div>
        <div className="flex h-full items-end justify-between space-x-2">
          <button
            className="flex whitespace-nowrap rounded bg-red-600 px-3 py-1 tracking-wide text-white duration-200 hover:bg-red-500"
            onClick={() => removePostClick(id, title)}
          >
            Delete
          </button>
          <Link
            className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
            href={postEditUrl}
          >
            Edit
          </Link>
        </div>
      </div>
      <StatusIndicator published={published} className="top-2 left-2" />
    </div>
  );
};

export default PostCard;
