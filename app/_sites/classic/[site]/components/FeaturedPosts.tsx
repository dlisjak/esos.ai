import PostCard from "./PostCard";

const FeaturedPosts = ({ featuredPosts, user, dict }: any) => {
  return (
    <div className="flex w-full flex-col">
      <h2 className="mx-2 my-4 text-3xl font-bold hover:underline md:text-4xl xl:mx-0">
        {dict.featuredPosts}
      </h2>
      <div className="grid grid-flow-row gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {featuredPosts.map((post: any, i: any) => (
          <PostCard
            className={`${
              i > 0 && i !== 3 && i !== 0
                ? "col-span-1 lg:row-span-2"
                : "col-span-1 lg:col-span-2 lg:row-span-3"
            }`}
            post={post}
            user={user}
            key={post.slug}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedPosts;
