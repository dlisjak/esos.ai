import Image from "next/image";
import Toc from "react-toc";

import CategoryBubble from "./CategoryBubble";
import Breadcrumbs from "./Breadcrumbs";

import { toDateString } from "@/lib/utils";
import { md } from "@/lib/md";
import { getCategorySlug, getPostSlug } from "@/lib/getPostSlug";

interface PostBodyProps {
  post: any;
  user?: any;
  lang: string;
}

const PostBody = ({ post, lang }: PostBodyProps) => {
  if (!post.content || !post.title)
    return (
      <div className="prose lg:prose-lg prose-a:text-blue-600 hover:prose-a:text-blue-500">
        <h1>Content Not Found</h1>
      </div>
    );

  return (
    <div className="w-full pt-4">
      <Breadcrumbs breadcrumbs={post.breadcrumbs} lang={lang} />
      <div className="lg:grid-rows-max grid grid-flow-row grid-cols-1 gap-4 pb-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="relative col-span-1 row-span-1 w-full sm:order-2 md:col-span-2 lg:order-2 lg:col-span-1">
          <Image
            className="h-full w-full object-cover object-cover"
            src={post?.image?.src ?? "/placeholder.png"}
            alt={post?.image?.alt || ""}
            width={767}
            height={767}
            priority
          />
        </div>
        <Toc
          className="table-of-contents lg:font-xl col-span-1 flex flex-col items-start divide-x-2 bg-slate-100 py-2 lg:order-3"
          markdownText={post.content}
        />
        <div className="col-span-1 sm:order-3 sm:col-span-2 lg:order-2 lg:row-span-3">
          <div className="mb-4 flex justify-start">
            <CategoryBubble
              href={getCategorySlug(post.category)}
              lang={lang}
              title={post.category.title}
            />
            <p className="my-2 whitespace-nowrap text-sm font-light text-gray-500 md:text-base">
              {toDateString(post.createdAt)}
            </p>
          </div>
          <div
            className="prose lg:prose-lg prose-a:text-blue-600 hover:prose-a:text-blue-500"
            dangerouslySetInnerHTML={{ __html: md.render(post.content) }}
          />
        </div>
      </div>
    </div>
  );
};

export default PostBody;
