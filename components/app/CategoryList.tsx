import CategoryCard from "./CategoryCard";

const CategoryList = ({
  categories,
  subdomain,
  addPostClick,
  removePostClick,
  isChild = false,
  isSubChild = false,
}) => {
  return (
    <ul className={`flex flex-col ${isChild ? "space-y-2" : "space-y-4"}`}>
      {categories.map((category) => {
        if (category?.parent?.id && !isChild) return;
        if (category?.parent?.id && !isSubChild) return;

        return (
          <CategoryCard
            category={category}
            subdomain={subdomain}
            addPostClick={addPostClick}
            removePostClick={removePostClick}
            key={category.id}
            isChild={isChild}
            isSubChild={isSubChild}
          />
        );
      })}
    </ul>
  );
};

export default CategoryList;
