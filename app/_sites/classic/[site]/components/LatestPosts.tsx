import Image from "next/image";

import CategoryBubble from "./CategoryBubble";

import { toDateString } from "@/lib/utils";
import Link from "./Link";
import { Dict } from "app/dictionaries";
import { getCategorySlug, getPostSlug } from "@/lib/getPostSlug";

interface LatestPostsProps {
  posts: any;
  user?: any;
  lang: string;
  dict: Dict;
}

const LatestPosts = ({ posts, user, lang, dict }: LatestPostsProps) => {
  return (
    <div className="flex w-full flex-col">
      <h2 className="mx-2 my-4 text-3xl font-bold hover:underline md:text-4xl xl:mx-0">
        {dict.latestPosts}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {posts.map((post: any) => (
          <div className="col-span-1" key={post.slug}>
            <Link
              lang={lang}
              className="relative flex aspect-square"
              href={getPostSlug(post, post.category)}
            >
              <Image
                alt={post.image?.alt ?? ""}
                className="h-full w-full object-cover"
                width={405}
                height={405}
                src={post.image?.src ?? "/placeholder.png"}
              />
            </Link>
            <div className="mx-auto mt-4 flex w-full flex-col items-start px-4 xl:px-0">
              <div className="flex">
                <CategoryBubble
                  href={getCategorySlug(post.category)}
                  lang={lang}
                  title={post.category?.title}
                />
                <div className="flex w-full items-center justify-start space-x-2 xl:space-x-4">
                  <p className="m-auto my-2 whitespace-nowrap text-sm font-light text-gray-500 md:text-base">
                    {toDateString(post.createdAt)}
                  </p>
                  <div className="hidden h-6 border-r border-gray-600 xl:flex" />
                  <div className="relative hidden h-8 w-8 overflow-hidden rounded-full xl:flex">
                    {user?.image && (
                      <Image
                        alt={user?.name ?? "User Avatar"}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                        src={user?.image}
                      />
                    )}
                  </div>
                  <p className="ml-3 inline-block hidden whitespace-nowrap align-middle text-sm font-semibold md:text-base xl:flex">
                    {user?.name}
                  </p>
                </div>
              </div>
              <Link lang={lang} href={getPostSlug(post, post.category)}>
                <h3 className="my-2 text-2xl font-bold hover:underline md:text-3xl">
                  {post.title}
                </h3>
              </Link>
              <p className="mb-2 w-full text-base line-clamp-2">
                {post.content?.substring(0, 350)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestPosts;
