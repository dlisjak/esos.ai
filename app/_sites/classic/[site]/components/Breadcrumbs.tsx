import Link from "./Link";

interface Breadcrumbs {
  id: number;
  title: string;
  slug: string;
}

interface BreadcrumbsPromps {
  breadcrumbs: Breadcrumbs[];
  lang: string;
}

const Breadcrumbs = ({ breadcrumbs, lang }: BreadcrumbsPromps) => {
  return (
    <div className="flex flex-wrap divide-x pb-4">
      {breadcrumbs?.map((breadcrumb, i) => (
        <Link
          className={`px-4 py-2 ${
            i + 1 !== breadcrumbs.length
              ? "text-blue-700"
              : "font-semibold underline"
          } hover:underline`}
          href={breadcrumb.slug}
          lang={lang}
          key={breadcrumb.id}
        >
          {breadcrumb.title}
        </Link>
      ))}
    </div>
  );
};

export default Breadcrumbs;
