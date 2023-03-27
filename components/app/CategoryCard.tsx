import { CategoryTranslation } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import CategoryList from "./CategoryList";
import { StatusIndicator } from "./PostCard";

const CategoryCard = ({
  subdomain,
  category,
  addPostClick,
  removePostClick,
  isChild = false,
  isSubChild = false,
}: any) => {
  if (!category) return <></>;
  const { id, title, slug, image, children, posts, translations } = category;

  const categoryPostsUrl = `/site/${subdomain}/categories/${id}/posts`;
  const categoryEditUrl = `/site/${subdomain}/categories/${id}`;
  const canDelete = !children?.length;

  return (
    <li className="flex flex-col space-y-2">
      <div
        className={`relative flex items-end rounded bg-white p-4 drop-shadow-sm ${
          isChild && !isSubChild ? "ml-8" : isSubChild ? "ml-16" : ""
        }`}
      >
        <div className="flex w-full overflow-hidden rounded">
          <div className="relative h-[120px]">
            <Link href={categoryPostsUrl}>
              <Image
                alt={image?.alt || "Placeholder image"}
                width={240}
                height={120}
                className="h-full object-cover"
                src={image?.src || "/placeholder.png"}
              />
            </Link>
          </div>
          <div className="relative flex flex-col items-start px-4">
            <div className="flex items-center">
              <Link href={categoryEditUrl} className="hover:underline">
                <h2 className="mb-1 text-xl font-semibold">{title}</h2>
              </Link>
            </div>
            <p className="right-1 w-auto rounded bg-gray-100 px-1 text-sm line-clamp-1">
              /{slug}
            </p>
            <Link
              href={categoryPostsUrl}
              className="mt-auto text-base line-clamp-1 hover:underline"
            >
              Posts({posts.length})
            </Link>
            <div className="mt-auto flex w-full overflow-x-auto text-sm">
              {translations?.map((translation: CategoryTranslation) => (
                <div
                  className="mr-1 rounded bg-gray-100 p-1 text-xs"
                  key={translation.id}
                >
                  {translation.lang}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex h-full flex-col items-end">
          <div className="flex h-full items-end justify-between space-x-2">
            {canDelete && (
              <button
                className="flex whitespace-nowrap rounded bg-red-600 px-3 py-1 tracking-wide text-white duration-200 hover:bg-red-500"
                onClick={() => removePostClick(id, title)}
              >
                Delete
              </button>
            )}
            <Link
              className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
              href={categoryEditUrl}
            >
              Edit
            </Link>
            <Link
              className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
              href={categoryPostsUrl}
            >
              Show Posts
            </Link>
            <button
              className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
              onClick={() => addPostClick(id)}
            >
              Add Post
            </button>
          </div>
        </div>
        <Link
          className="absolute top-4 right-4 flex items-center justify-center rounded bg-slate-400 px-1 tracking-wide text-white duration-200 hover:bg-slate-600"
          href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}/${slug}`}
          rel="noreferrer"
          target="_blank"
        >
          ↗
        </Link>
        <StatusIndicator published={true} className="top-2 left-2" />
      </div>
      {Array.isArray(children) && children.length > 0 && (
        <CategoryList
          categories={children}
          subdomain={subdomain}
          addPostClick={addPostClick}
          isChild={true}
          removePostClick={removePostClick}
          isSubChild={isChild}
        />
      )}
    </li>
  );
};

export default CategoryCard;
