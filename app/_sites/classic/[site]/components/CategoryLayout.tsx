import Image from "next/image";
import MarkdownIt from "markdown-it";

import CategoryPosts from "./CategoryPosts";

const CategoryLayout = ({ category, user }: any) => {
  const md = new MarkdownIt({
    linkify: true,
    typographer: true,
  })
    .use(require("markdown-it-emoji"))
    .use(require("markdown-it-sub"))
    .use(require("markdown-it-sup"))
    .use(require("markdown-it-footnote"))
    .use(require("markdown-it-deflist"))
    .use(require("markdown-it-abbr"));

  return (
    <div className="mt-4 grid grid-flow-row grid-cols-1 gap-4 md:grid-cols-2 lg:mt-8 lg:grid-cols-3 xl:gap-8">
      <div className="relative col-span-1 aspect-square">
        <Image
          className="h-full w-full object-cover"
          src={category?.image?.src ?? "/placeholder.png"}
          alt={category?.image?.alt || ""}
          width={767}
          height={767}
          priority
        />
      </div>
      <div className="col-span-1 mx-4 md:mx-0 lg:col-span-2">
        <div
          className="prose lg:prose-xl md:pr-4"
          dangerouslySetInnerHTML={{ __html: md.render(category.description) }}
        />
      </div>
      <CategoryPosts posts={category?.posts} user={user} />
    </div>
  );
};

export default CategoryLayout;
