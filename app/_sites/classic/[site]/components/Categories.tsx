import Image from "next/image";
import Link from "next/link";

const Categories = ({ category, posts }: any) => {
  return (
    <div className="my-8 flex w-full flex-col">
      <h2 className="my-2 text-3xl font-bold hover:underline md:text-4xl">
        <Link href={`/${category.slug}`}>{category.title}</Link>
      </h2>
      <div className="grid gap-4 lg:grid-cols-5 xl:gap-8">
        {posts.map((post: any) => (
          <div className="col-span-1" key={post.slug}>
            <Image
              alt={post.image?.alt ?? ""}
              className="h-full w-full object-cover"
              width={850}
              height={630}
              src={post.image?.src ?? "/placeholder.png"}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
