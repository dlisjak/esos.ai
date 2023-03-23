import Image from "next/image";
import { toDateString } from "@/lib/utils";
import CategoryBubble from "./CategoryBubble";
import RelatedPosts from "./RelatedPosts";
import { md } from "@/lib/md";

interface PostBodyProps {
  post: any;
  user?: any;
  lang: string;
}

const PostBody = ({ post, user, lang }: PostBodyProps) => {
  const firstHeadline = post.content.indexOf("##");
  const mdExcerpt = post.content.substring(0, firstHeadline);
  const mdElse = post.content.substring(firstHeadline - 2);

  return (
    <div className="flex flex-col">
      <div className="container mx-auto mb-20 w-full max-w-screen-xl">
        <div className="mt-8 grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-3 xl:gap-8">
          <div className="order-2 col-span-1 px-4 lg:order-1 lg:col-span-2 xl:px-0">
            <div
              className="prose mx-auto lg:prose-xl lg:mx-0"
              dangerouslySetInnerHTML={{ __html: md.render(mdExcerpt) }}
            />
            <div
              className="prose mx-auto lg:prose-xl lg:mx-0"
              dangerouslySetInnerHTML={{
                __html: md.render(
                  firstHeadline > 0 ? "[[toc]]" + mdElse : "" + mdElse
                ),
              }}
            />
          </div>

          <div className="relative col-span-1 aspect-[4/3] lg:order-2 lg:aspect-square">
            <Image
              className="h-full w-full object-cover"
              src={post?.image?.src ?? "/placeholder.png"}
              alt={post?.image?.alt || ""}
              width={767}
              height={767}
              priority
            />
            <div className="m-2 flex justify-center lg:justify-start">
              <CategoryBubble
                href={`${
                  post.category?.parent?.slug
                    ? "/" + post.category?.parent?.slug
                    : ""
                }/${post.category?.slug}`}
                lang={lang}
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
        </div>
      </div>
      {post.category.posts.length > 0 && (
        <RelatedPosts post={post} user={user} lang={lang} />
      )}
    </div>
  );
};

export default PostBody;
