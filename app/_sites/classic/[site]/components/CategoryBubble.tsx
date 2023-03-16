import Link from "next/link";

const CategoryBubble = ({ href, title }: any) => {
  return (
    <Link
      href={href}
      className="mr-4 flex w-auto items-center justify-center whitespace-nowrap rounded-full border px-4 py-1"
    >
      {title}
    </Link>
  );
};

export default CategoryBubble;
