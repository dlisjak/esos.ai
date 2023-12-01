import CategoryCard from "./CategoryCard";

const CategoryList = ({
  categories,
  slug = "",
  subdomain,
  addPostClick,
  removePostClick,
  site,
  isChild = false,
  isSubChild = false,
  isSubSubChild = false,
  isSubSubSubChild = false,
}: any) => {
  return (
    <ul className={`flex flex-col ${isChild ? "space-y-2" : "space-y-4"}`}>
      {categories.map((category: any) => {
        if (category?.parent?.id && !isChild) return;
        if (category?.parent?.id && !isSubChild) return;
        if (category?.parent?.id && !isSubSubChild) return;
        if (category?.parent?.id && !isSubSubSubChild) return;

        const categorySlug = `${slug ? slug : ""}${
          category.slug ? "/" + category.slug : ""
        }`;

        return (
          <CategoryCard
            category={category}
            slug={categorySlug}
            site={site}
            subdomain={subdomain}
            addPostClick={addPostClick}
            removePostClick={removePostClick}
            key={category.id}
            isChild={isChild}
            isSubChild={isSubChild}
            isSubSubChild={isSubSubChild}
            isSubSubSubChild={isSubSubSubChild}
          />
        );
      })}
    </ul>
  );
};

export default CategoryList;
