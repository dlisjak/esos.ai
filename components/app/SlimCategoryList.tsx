import Link from "next/link";
import { StatusIndicator } from "./PostCard";

const SlimCategory = ({ category, subdomain, isChild, isSubChild }: any) => {
  if (!category) return <></>;

  const viewUrl = `/site/${subdomain}/categories/${category.id}/posts`;
  const editUrl = `/site/${subdomain}/categories/${category.id}`;

  return (
    <li className="flex flex-col divide-y">
      <div
        className={`relative flex items-center justify-between bg-white py-2 pr-2 pl-4 ${
          isChild && !isSubChild ? "ml-3" : isSubChild ? "ml-6" : ""
        }`}
      >
        <StatusIndicator
          published={category.posts?.length || category.published}
          className="top-6 left-0"
        />
        <div className="ml-4 flex flex-col items-start justify-center">
          <h3 className="text-xl font-semibold line-clamp-1">
            {category.title} ({category.posts?.length})
          </h3>
          <p className="right-1 flex w-auto rounded bg-gray-100 px-1 text-xs line-clamp-1">
            /{category.slug}
          </p>
        </div>
        <div className="flex h-full flex-col items-end">
          <div className="relative flex justify-between"></div>
          <div className="ml-2 flex h-full items-end justify-between space-x-2">
            {viewUrl && (
              <Link
                className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
                href={viewUrl}
              >
                Posts
              </Link>
            )}
            {editUrl && (
              <Link
                className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
                href={editUrl}
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>
      {Array.isArray(category.children) && category.children.length > 0 && (
        <SlimCategoryList
          categories={category.children}
          subdomain={subdomain}
          isChild={true}
          isSubChild={isChild}
        />
      )}
    </li>
  );
};

const SlimCategoryList = ({
  categories,
  subdomain,
  isChild = false,
  isSubChild = false,
}: any) => {
  if (!categories) return <></>;

  return (
    <ul className="flex flex-col divide-y">
      {categories.map((category: any) => {
        if (category?.parent?.id && !isChild) return;
        if (category?.parent?.id && !isSubChild) return;

        return (
          <SlimCategory
            category={category}
            subdomain={subdomain}
            isChild={isChild}
            isSubChild={isSubChild}
            key={category.id}
          />
        );
      })}
    </ul>
  );
};

export default SlimCategoryList;
