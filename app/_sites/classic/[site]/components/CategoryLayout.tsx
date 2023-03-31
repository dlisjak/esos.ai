import Image from "next/image";

import CategoryPosts from "./CategoryPosts";

import { md } from "@/lib/md";
import SubCategories from "./SubCategories";
import { notFound } from "next/navigation";
import Breadcrumbs from "./Breadcrumbs";
import CategoryNavigation from "./CategoryNavigation";
import { Dict } from "app/dictionaries";

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
      <div className="grid grid-flow-row grid-cols-1 gap-4 pb-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="relative col-span-1 w-full sm:order-2 md:col-span-2 lg:col-span-1">
          <Image
            className="h-full w-full object-cover object-cover"
            src={category?.image?.src ?? "/placeholder.png"}
            alt={category?.image?.alt || ""}
            width={767}
            height={767}
            priority
          />
        </div>
        <CategoryNavigation
          className="flex flex-wrap lg:order-2 lg:col-span-3"
          navigation={category.navigation}
          lang={lang}
          dict={dict}
        />
        <div className="col-span-1 sm:order-3 sm:col-span-2 lg:order-1">
          <div
            className="prose pt-4"
            dangerouslySetInnerHTML={{ __html: md.render(category.content) }}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SubCategories
          category={category}
          navigation={category.navigation}
          lang={lang}
        />
        <CategoryPosts category={category} lang={lang} />
      </div>
    </div>
  );
};

export default CategoryLayout;
