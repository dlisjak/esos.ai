import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "@/components/app/Layout";
import SlimCard from "@/components/app/SlimPostCard";
import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";
import SlimCategoryList from "@/components/app/SlimCategoryList";
import ContainerLoader from "@/components/app/ContainerLoader";

import {
  useCategories,
  useLatestPosts,
  useFeaturedPosts,
  usePosts,
  useSite,
} from "@/lib/queries";

export default function Dashboard() {
  const router = useRouter();
  const { subdomain } = router.query;

  const { site } = useSite(subdomain && subdomain);

  const { posts } = usePosts(subdomain, true, site?.isWordpress);

  const { categories, isLoading: isLoadingCategories } = useCategories(
    subdomain,
    site?.isWordpress
  );
  const { posts: draftPosts, isLoading: isLoadingDraftPosts } = usePosts(
    subdomain,
    false,
    site?.isWordpress
  );
  const { latestPosts, isLoading: isLoadingLatestPosts } = useLatestPosts(
    subdomain,
    5,
    site?.isWordpress
  );
  const { featuredPosts, isLoading: isLoadingFeaturedPosts } =
    useFeaturedPosts(subdomain);

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Dashboard</h1>
        </div>
      </Header>
      <Container dark>
        <div className="flex gap-x-4">
          <div className="flex w-full flex-col gap-y-4 gap-x-4">
            <div className="w-full rounded border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl">Latest Posts</h2>
                <Link
                  href={`/site/${subdomain}/posts`}
                  className="hover:underline"
                >
                  All Posts ({posts?.length})
                </Link>
              </div>
              {isLoadingLatestPosts ? (
                <ContainerLoader />
              ) : (
                <ul className="space-y-0 divide-y overflow-hidden rounded border">
                  {latestPosts &&
                    latestPosts.map((post: any) => (
                      <SlimCard
                        post={post}
                        editUrl={`/site/${subdomain}/posts/${post.id}`}
                        isWordpress={post?.isWordpress}
                        key={`latest--${post.id}`}
                      />
                    ))}
                </ul>
              )}
            </div>
            <div className="w-full rounded border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl">Featured Posts</h2>
                <Link
                  href={`/site/${subdomain}/posts/featured`}
                  className="hover:underline"
                >
                  All Featured
                </Link>
              </div>
              {isLoadingFeaturedPosts ? (
                <ContainerLoader />
              ) : (
                <ul className="space-y-0 divide-y overflow-hidden rounded border">
                  {featuredPosts &&
                    featuredPosts.map((post: any) => (
                      <SlimCard
                        post={post}
                        editUrl={`/site/${subdomain}/posts/${post.id}`}
                        isWordpress={post?.isWordpress}
                        key={`featured--${post.id}`}
                      />
                    ))}
                </ul>
              )}
            </div>
            <div className="w-full rounded border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl">Draft Posts</h2>
                <Link
                  href={`/site/${subdomain}/posts/drafts`}
                  className="hover:underline"
                >
                  All Drafts ({draftPosts?.length})
                </Link>
              </div>
              {isLoadingDraftPosts ? (
                <ContainerLoader />
              ) : (
                <ul className="space-y-0 divide-y overflow-hidden rounded border">
                  {draftPosts &&
                    draftPosts?.map((post: any) => (
                      <SlimCard
                        post={post}
                        editUrl={`/site/${subdomain}/posts/${post.id}`}
                        isWordpress={post?.isWordpress}
                        key={`draft--${post.id}`}
                      />
                    ))}
                </ul>
              )}
            </div>
          </div>
          <div className="w-full rounded border bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">Categories</h2>
              <Link
                href={`/site/${subdomain}/categories`}
                className="hover:underline"
              >
                All Categories ({categories?.length})
              </Link>
            </div>
            {isLoadingCategories ? (
              <ContainerLoader />
            ) : (
              <ul className="space-y-0 divide-y overflow-hidden rounded border">
                <SlimCategoryList
                  categories={categories}
                  subdomain={subdomain}
                />
              </ul>
            )}
          </div>
        </div>
      </Container>
    </Layout>
  );
}
