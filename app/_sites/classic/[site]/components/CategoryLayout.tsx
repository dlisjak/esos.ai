import Image from "next/image";

import CategoryPosts from "./CategoryPosts";

import { md } from "@/lib/md";
import SubCategories from "./SubCategories";
import { notFound } from "next/navigation";

interface CategoryLayoutProps {
  category: any;
  user?: any;
  lang: string;
}

const CategoryLayout = ({ category, user, lang }: CategoryLayoutProps) => {
  if (!category.title || !category.content)
    return (
      <div className="prose py-8">
        <h1>Content not found</h1>
      </div>
    );

  return (
    <div className="mt-8 grid grid-flow-row grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
      <div className="col-span-1 mx-4 lg:col-span-2 xl:mx-0">
        <div className="prose lg:prose-xl md:pr-4">
          <h1>{category.title}</h1>
          <div
            dangerouslySetInnerHTML={{ __html: md.render(category.content) }}
          />
        </div>
      </div>
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
      {category.posts.length > 0 ? (
        <CategoryPosts posts={category?.posts} user={user} lang={lang} />
      ) : (
        <SubCategories category={category} lang={lang} key={category.slug} />
      )}
    </div>
  );
};

export default CategoryLayout;
