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
  if (!breadcrumbs || !breadcrumbs.length) return <div />;
  return (
    <div className="flex flex-wrap divide-x pb-4">
      {breadcrumbs?.map((breadcrumb: any) => (
        <Link
          className="whitespace-nowrap px-4 py-2 text-blue-700 hover:underline"
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
