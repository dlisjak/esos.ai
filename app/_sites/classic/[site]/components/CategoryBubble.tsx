import Link from "./Link";

interface CategoryBubbleProps {
  href: string;
  title: string;
  lang: string;
}

const CategoryBubble = ({ href, title, lang }: CategoryBubbleProps) => {
  if (!title) return <div />;
  return (
    <Link
      href={href}
      lang={lang}
      className="mr-4 flex w-auto items-center justify-center whitespace-nowrap rounded-full border px-4 py-1 text-center"
    >
      {title}
    </Link>
  );
};

export default CategoryBubble;
