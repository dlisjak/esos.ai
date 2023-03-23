import PostCard from "./PostCard";

interface RelatedPostsProps {
  post: any;
  user?: any;
  lang: string;
}

const RelatedPosts = ({ post, user, lang }: RelatedPostsProps) => {
  return (
    <div className="mt-8 bg-gray-100 py-8">
      <div className="container mx-auto mb-4 w-full max-w-screen-xl">
        <h2 className="mb-8 px-4 text-3xl font-bold md:text-4xl">
          Read More From {post.category.title}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {post.category.posts.map((post: any) => (
            <PostCard post={post} user={user} lang={lang} h3 key={post.slug} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedPosts;
