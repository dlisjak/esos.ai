import { getPostSlug } from "@/lib/getPostSlug";
import { toDateString } from "@/lib/utils";
import Image from "next/image";
import CategoryBubble from "./CategoryBubble";
import Link from "./Link";
// import { md } from "@/lib/md";

interface PostCardProps {
  className?: string;
  post: any;
  user?: any;
  h3?: boolean;
  lang: string;
}

const PostCard = ({
  className = "",
  post,
  user,
  lang,
  h3 = false,
}: PostCardProps) => {
  return (
    <div className={className}>
      <Link lang={lang} href={getPostSlug(post, post.category)}>
        <div className="group relative mx-auto aspect-[4/3] w-full overflow-hidden">
          <Image
            alt={post.image?.alt ?? ""}
            className="h-full w-full object-cover"
            width={850}
            height={630}
            src={post.image?.src ?? "/placeholder.png"}
          />
        </div>
      </Link>
      <div className="mx-auto mt-4 flex w-full flex-col items-start px-4 xl:px-0">
        <div className="flex">
          <CategoryBubble
            href={`${
              post.category?.parent?.slug
                ? "/" + post.category?.parent?.slug
                : ""
            }/${post.category?.slug}`}
            lang={lang}
            title={post.category.title}
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
          {h3 ? (
            <h3 className="my-2 text-2xl font-bold hover:underline md:text-3xl">
              {post.title}
            </h3>
          ) : (
            <h2 className="my-2 text-3xl font-bold hover:underline md:text-4xl">
              {post.title}
            </h2>
          )}
        </Link>
        <p className="mb-2 w-full text-base line-clamp-2">
          {post.content?.substring(0, 350).replace("#", "").replace("##", "")}
        </p>
      </div>
    </div>
  );
};

export default PostCard;
