import Link from "./Link";

interface CategoryBubbleProps {
  href: string;
  title: string;
  lang: string;
}

const CategoryBubble = ({ href, title, lang }: CategoryBubbleProps) => {
  return (
    <Link
      href={href}
      lang={lang}
      className="mr-4 flex w-auto items-center justify-center whitespace-nowrap rounded-full border px-4 py-1"
    >
      {title}
    </Link>
  );
};

export default CategoryBubble;
