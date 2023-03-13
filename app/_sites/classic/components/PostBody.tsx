import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";

const PostBody = ({ post, user }) => {
  console.log(post.content);
  return (
    <div className="mt-4 grid grid-flow-row grid-cols-1 gap-4 md:grid-cols-2 lg:mt-8 lg:grid-cols-3 xl:gap-8">
      <div className="relative col-span-1 aspect-square">
        {post?.image && (
          <Image
            className="h-full w-full object-cover"
            src={post?.image}
            alt={post?.title || ""}
            width={767}
            height={767}
          />
        )}
      </div>
      <div className="col-span-1 mx-4 md:mx-0 lg:col-span-2">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">{post?.title}</h1>
        <div className="prose">
          {/* @ts-expect-error Server Component */}
          <MDXRemote source={post?.content} />
        </div>
      </div>
    </div>
  );
};

export default PostBody;
