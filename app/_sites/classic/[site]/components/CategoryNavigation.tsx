import { Dict } from "app/dictionaries";
import Link from "./Link";

interface CategoryNavigation {
  id: string;
  title: string;
  href: string;
}

interface CategoryNavigationProps {
  className?: string;
  navigation: CategoryNavigation[];
  lang: string;
  dict: Dict;
}

const CategoryNavigation = ({
  className = "",
  navigation,
  lang,
  dict,
}: CategoryNavigationProps) => {
  if (!navigation || !navigation.length) return <div />;

  return (
    <div
      className={`${className} flex items-start divide-x-2 bg-slate-100 py-2`}
    >
      <h2 className="px-4 pt-2 font-semibold lg:text-xl">{dict.navigation}:</h2>
      {navigation?.map((nav: CategoryNavigation) => (
        <Link
          className="px-4 py-2 text-blue-700 hover:underline lg:text-lg"
          href={nav.href}
          lang={lang}
          key={nav.id}
        >
          {nav.title}
        </Link>
      ))}
    </div>
  );
};

export default CategoryNavigation;
