import Image from "next/image";

import CategoryPosts from "./CategoryPosts";

import { md } from "@/lib/md";
import SubCategories from "./SubCategories";
import { notFound } from "next/navigation";
import Breadcrumbs from "./Breadcrumbs";
import CategoryNavigation from "./CategoryNavigation";
import { Dict } from "app/dictionaries";
import Toc from "react-toc";

interface CategoryLayoutProps {
  category: any;
  lang: string;
  dict: Dict;
}

const CategoryLayout = ({ category, lang, dict }: CategoryLayoutProps) => {
  if (!category.title || !category.content) return notFound();

  return (
    <div className="w-full pt-4">
      <Breadcrumbs breadcrumbs={category.breadcrumbs} lang={lang} />
      <div className="lg:grid-rows-max grid grid-flow-row grid-cols-1 gap-4 pb-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="relative col-span-1 row-span-1 w-full sm:order-2 md:col-span-2 lg:order-2 lg:col-span-1">
          <Image
            className="h-full w-full object-cover object-cover"
            src={category?.image?.src ?? "/placeholder.png"}
            alt={category?.image?.alt || ""}
            width={767}
            height={767}
            priority
          />
        </div>
        <div className="lg:font-xl col-span-1 flex flex-col items-start divide-x-2 bg-slate-100 py-2 lg:order-3">
          {category.navigation && category.navigation.length > 0 && (
            <CategoryNavigation
              className="flex flex-wrap"
              navigation={category.navigation}
              lang={lang}
              dict={dict}
            />
          )}
        </div>
        <div className="col-span-1 sm:order-3 sm:col-span-2 lg:order-2 lg:row-span-3">
          <div
            className="prose pt-4 lg:prose-lg prose-a:text-blue-600 hover:prose-a:text-blue-500"
            dangerouslySetInnerHTML={{ __html: md.render(category.content) }}
          />
        </div>
      </div>
      {category.posts && category.posts.length > 0 && (
        <>
          <h2 className="my-2 text-xl font-bold md:text-2xl">
            Read about {category.title}:
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryPosts category={category} lang={lang} />
          </div>
        </>
      )}
      {category.children && category?.children.length > 0 && (
        <>
          <h2 className="my-2 text-xl font-bold md:text-2xl">Discover:</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SubCategories
              category={category}
              navigation={category.navigation}
              lang={lang}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryLayout;
