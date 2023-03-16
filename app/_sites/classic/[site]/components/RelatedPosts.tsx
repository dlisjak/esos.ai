import PostCard from "./PostCard";

const RelatedPosts = ({ post, user }) => {
  return (
    <div className="mt-8 bg-gray-100 py-8">
      <div className="container mx-auto mb-4 w-full max-w-screen-xl">
        <h2 className="mb-8 px-4 text-3xl font-bold md:text-4xl">
          Read More From {post.category.title}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {post.category.posts.map((post) => (
            <PostCard post={post} user={user} h3 key={post.slug} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedPosts;