import Image from "next/image";

import Link from "./Link";

const SubCategories = ({ category, lang }: any) => {
  return category?.children?.map((subcategory: any) => (
    <div className="col-span-1" key={subcategory.slug}>
      <Link
        href={`${category?.slug ? "/" + subcategory?.slug : ""}`}
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
      <div className="mx-auto mt-4 flex w-full flex-col items-start px-4 xl:px-0">
        <Link href={`${"/" + category?.slug}/${subcategory.slug}`} lang={lang}>
          <h3 className="my-2 text-2xl font-bold hover:underline md:text-3xl">
            {subcategory.title}
          </h3>
        </Link>
      </div>
    </div>
  ));
};

export default SubCategories;
