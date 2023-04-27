import Image from "next/image";

import CategoryPosts from "./CategoryPosts";

import { md } from "@/lib/md";
import SubCategories from "./SubCategories";
import { notFound } from "next/navigation";
import Breadcrumbs from "./Breadcrumbs";
import CategoryNavigation from "./CategoryNavigation";
import { Dict } from "app/dictionaries";
import Toc from "react-toc";
import CategoryBubble from "./CategoryBubble";
import { getCategorySlug } from "@/lib/getPostSlug";
import { toDateString } from "@/lib/utils";

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
      <div className="lg:grid-rows-max grid grid-flow-row grid-cols-1 gap-4 pb-8">
        <div className="heading">
          <div
            className="prose w-full py-4 lg:prose-lg"
            dangerouslySetInnerHTML={{ __html: md.render(category.heading) }}
          />
          <div className="flex justify-start">
            <CategoryBubble
              href={getCategorySlug(category.parent)}
              lang={lang}
              title={category.parent?.title}
            />
            <p className="my-2 whitespace-nowrap text-sm font-light text-gray-500 md:text-base">
              {toDateString(category.createdAt)}
            </p>
          </div>
        </div>
        <div className="relative col-span-1 row-span-1 w-full">
          <Image
            className="h-full w-full object-cover object-cover"
            src={category?.image?.src ?? "/placeholder.png"}
            alt={category?.image?.alt || ""}
            width={1280}
            height={720}
            priority
          />
        </div>
        <div className="lg:font-xl col-span-1 flex flex-col items-start divide-x-2 bg-slate-100">
          {category.navigation && category.navigation.length > 0 && (
            <CategoryNavigation
              className="flex flex-wrap"
              navigation={category.navigation}
              lang={lang}
              dict={dict}
            />
          )}
        </div>
        <div className="col-span-1 grid grid-cols-3 gap-4 lg:grid-cols-4">
          <div
            className="prose col-span-3 mx-auto w-full pt-4 text-justify lg:prose-lg prose-a:text-blue-600 hover:prose-a:text-blue-500"
            dangerouslySetInnerHTML={{ __html: md.render(category.bodyText) }}
          />
          <div className="static col-span-1 flex hidden flex-col lg:flex">
            <Toc
              className="table-of-contents lg:font-xl sticky top-4 flex flex-col items-start divide-x-2 bg-slate-100 py-2"
              markdownText={category.content}
              lowestHeadingLevel={2}
            />
          </div>
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
