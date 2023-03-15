import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { toDateString } from "@/lib/utils";
import Link from "next/link";
import PostCard from "./PostCard";
import CategoryBubble from "./CategoryBubble";

const PostBody = ({ post, user }) => {
  return (
    <div className="flex flex-col">
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        <div className="mt-4 grid grid-flow-row grid-cols-1 gap-4 lg:mt-8 lg:grid-cols-3 xl:gap-8">
          <div className="relative col-span-1 aspect-[4/3] lg:aspect-square">
            {post?.image && (
              <Image
                className="h-full w-full object-cover"
                src={post?.image?.src ?? "/placeholder.png"}
                alt={post?.image?.alt || ""}
                width={767}
                height={767}
              />
            )}
            <div className="m-2 flex justify-center lg:justify-start">
              <CategoryBubble
                href={`${
                  post.category?.parent?.slug
                    ? "/" + post.category?.parent?.slug
                    : ""
                }/${post.category?.slug}`}
                title={post.category.title}
              />
              <div className="flex items-center justify-start space-x-2 xl:space-x-4">
                <p className="my-2 whitespace-nowrap text-sm font-light text-gray-500 md:text-base">
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
          </div>
          <div className="col-span-1 px-4 lg:col-span-2 lg:px-0">
            <div className="prose mx-auto lg:mx-0">
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                {post?.title}
              </h1>
              {/* @ts-expect-error Server Component */}
              <MDXRemote source={post?.content} />
            </div>
          </div>
        </div>
      </div>
      {post.category.posts.length > 0 && (
        <div className="mt-8 bg-slate-100 py-8">
          <div className="container mx-auto mb-4 w-full max-w-screen-xl">
            <h2 className="mb-8 text-3xl font-bold md:text-4xl">
              Read More From {post.category.title}
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {post.category.posts.map((post) => (
                <PostCard post={post} user={user} h3 key={post.slug} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostBody;
