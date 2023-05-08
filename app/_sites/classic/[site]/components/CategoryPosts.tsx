import Image from "next/image";

import Link from "./Link";

import { toDateString } from "@/lib/utils";

interface CategoryPostsProps {
  category: any;
  lang: string;
}

const CategoryPosts = ({ category, lang }: CategoryPostsProps) => {
  if (!category || !category.posts.length) return <div />;

  return category.posts.map((post: any) => (
    <div className="col-span-1 pb-4" key={post.slug}>
      <Link
        href={post.slug}
        lang={lang}
        className="relative flex aspect-square"
      >
        <Image
          alt={post.image?.alt ?? ""}
          className="h-full w-full object-cover"
          width={405}
          height={405}
          src={post.image?.src ?? "/placeholder.png"}
        />
      </Link>
      <div className="mx-auto mt-2 flex w-full flex-col items-start">
        <p className="m-auto text-sm font-light text-gray-500 md:text-base">
          {toDateString(post.updatedAt)}
        </p>
        <Link href={post.slug} lang={lang}>
          <h3 className="my-2 text-2xl font-bold hover:underline md:text-3xl">
            {post.title}
          </h3>
        </Link>
      </div>
    </div>
  ));
};

export default CategoryPosts;
