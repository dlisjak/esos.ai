import Image from "next/image";

import Link from "./Link";

const SubCategories = ({ category, navigation, lang }: any) => {
  return category?.children?.map((subcategory: any, i: number) => (
    <div className="col-span-1 pb-4" key={subcategory.slug}>
      <Link
        href={navigation[i].href}
        lang={lang}
        className="relative flex aspect-square"
      >
        <Image
          alt={subcategory.image?.alt ?? ""}
          className="h-full w-full object-cover"
          width={405}
          height={405}
          src={subcategory.image?.src ?? "/placeholder.png"}
        />
      </Link>
      <div className="mx-auto mt-2 flex w-full flex-col items-start xl:px-0">
        <Link href={navigation[i].href} lang={lang}>
          <h3 className="text-xl font-bold hover:underline md:text-2xl">
            {subcategory.title}
          </h3>
        </Link>
      </div>
    </div>
  ));
};

export default SubCategories;
