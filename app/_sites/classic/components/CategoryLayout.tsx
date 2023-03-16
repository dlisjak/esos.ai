import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";

import CategoryPosts from "./CategoryPosts";

const CategoryLayout = ({ category, user }) => {
  return (
    <div className="mt-4 grid grid-flow-row grid-cols-1 gap-4 md:grid-cols-2 lg:mt-8 lg:grid-cols-3 xl:gap-8">
      <div className="relative col-span-1 aspect-square">
        <Image
          className="h-full w-full object-cover"
          src={category?.image?.src ?? "/placeholder.png"}
          alt={category?.image?.alt || ""}
          width={767}
          height={767}
          priority
        />
      </div>
      <div className="col-span-1 mx-4 md:mx-0 lg:col-span-2">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          {category?.title}
        </h1>
        <div className="prose md:pr-4">
          {/* @ts-expect-error Server Component */}
          <MDXRemote source={category?.description} />
        </div>
      </div>
      <CategoryPosts posts={category?.posts} user={user} />
    </div>
  );
};

export default CategoryLayout;
