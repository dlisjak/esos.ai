import { useRouter } from "next/router";
import { useRef, useState } from "react";
import getSlug from "speakingurl";

import Layout from "@/components/app/Layout";
import Modal from "@/components/Modal";
import LoadingDots from "@/components/app/loading-dots";

import { HttpMethod } from "@/types";

import PostCard from "@/components/app/PostCard";
import { toast } from "react-hot-toast";
import AddNewButton from "@/components/app/AddNewButton";
import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";
import ContainerLoader from "@/components/app/ContainerLoader";
import { useCategories, usePosts, usePrompts } from "@/lib/queries";

const JSON_PLACEHOLDER = `{
	"posts": [{
			"title": "Introduction to [Topic]: A Comprehensive Guide for Beginners",
			"published": "true"
		},
		{
			"title": "Top 7 Tips for [Topic]: Expert Advice for Success",
			"published": "true"
		},
		{
			"title": "The Future of [Topic]: Emerging Trends and Innovations to Watch",
			"published": "true"
		},
		{
			"title": "Common Mistakes to Avoid in [Topic]: Tips for Success",
			"published": "true"
		},
		{
			"title": "The Pros and Cons of [Topic]: Is it Right for You?",
			"published": "true"
		}
	]
}`;

export default function Posts() {
  const [bulkCreateContent, setBulkCreateContent] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [creatingPost, setCreatingPost] = useState<boolean>(false);
  const [deletingPost, setDeletingPost] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showBulkCreateModal, setShowBulkCreateModal] =
    useState<boolean>(false);

  const [importContentPrompt, setImportContentPrompt] = useState<string>("");
  const [bulkPostsCategory, setBulkPostsCategory] = useState<string>("");

  const [deletingPostTitle, setDeletingPostTitle] = useState();
  const [deletingPostId, setDeletingPostId] = useState();

  const categoriesJSONRef = useRef<HTMLTextAreaElement | null>(null);
  const postTitleRef = useRef<HTMLInputElement | null>(null);
  const postSlugRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const { subdomain } = router.query;

  const { posts, isLoading, mutateSubdomainPosts } = usePosts(subdomain, true);
  const { categories } = useCategories(subdomain);
  const { prompts } = usePrompts();

  async function createPost(subdomain: string | string[] | undefined) {
    if (!subdomain) return;
    setCreatingPost(true);
    if (!postTitleRef.current || !postSlugRef.current) return;
    const title = postTitleRef.current.value;
    const slug = postSlugRef.current.value;
    const data = { title, slug };

    try {
      const res = await fetch(`/api/post?subdomain=${subdomain}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Post Created");
        router.push(`/site/${subdomain}/posts/${data.postId}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function deletePost(postId: any) {
    if (!postId) return;
    setDeletingPost(true);

    try {
      const res = await fetch(`/api/post?postId=${postId}`, {
        method: HttpMethod.DELETE,
      });

      if (res.ok) {
        toast.success(`Post Deleted`);
        mutateSubdomainPosts();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingPost(false);
      setShowDeleteModal(false);
    }
  }

  const generateSlug = (e: any) => {
    const title = e.target.value;
    const slug = getSlug(title);

    if (!postSlugRef?.current) return;
    postSlugRef.current.value = slug;
  };

  const handleRemovePostClick = (postId: any, postTitle: any) => {
    setDeletingPostId(postId);
    setDeletingPostTitle(postTitle);
    setShowDeleteModal(true);
  };

  const makeFeatured = async (postId: any, isFeatured: any) => {
    if (!postId) return;

    try {
      const res = await fetch(`/api/post/feature?postId=${postId}`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFeatured,
        }),
      });

      if (res.ok) {
        toast.success(`Post Featured`);
        mutateSubdomainPosts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const bulkCreatePosts = async (subdomain: string | string[] | undefined) => {
    if (!subdomain) return;

    console.log({ subdomain });
  };

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Published</h1>
          <div className="flex space-x-2">
            <AddNewButton onClick={() => setShowBulkCreateModal(true)} light>
              Import <span className="ml-2">＋</span>
            </AddNewButton>
            <AddNewButton onClick={() => setShowModal(true)}>
              Add Post <span className="ml-2">＋</span>
            </AddNewButton>
          </div>
        </div>
      </Header>
      <Container dark>
        {isLoading ? (
          <ContainerLoader />
        ) : (
          <div className="grid gap-y-4">
            {posts && posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  post={post}
                  subdomain={subdomain}
                  postEditUrl={`/site/${subdomain}/posts/${post.id}`}
                  removePostClick={handleRemovePostClick}
                  makeFeatured={makeFeatured}
                  key={post.id}
                />
              ))
            ) : (
              <div className="text-center">
                <p className="my-4 text-2xl text-gray-600">
                  No posts yet. Click &quot;Add Post&quot; to create one.
                </p>
              </div>
            )}
          </div>
        )}
      </Container>

      <Modal showModal={showModal} setShowModal={setShowModal}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createPost(subdomain);
          }}
          className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <div className="px-8">
            <h2 className="mb-6 text-2xl">Add a New Post</h2>
            <div className="flex-start flex flex-col items-center space-y-4">
              <input
                className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                name="title"
                required
                placeholder="Post Title"
                ref={postTitleRef}
                type="text"
                onBlur={generateSlug}
              />
              <input
                className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                name="slug"
                required
                placeholder="Post Slug"
                ref={postSlugRef}
                type="text"
              />
            </div>
          </div>
          <div className="mt-10 flex w-full items-center justify-between">
            <button
              type="button"
              className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-600 transition-all duration-150 ease-in-out hover:text-black focus:outline-none focus:ring-0"
              onClick={() => {
                setShowModal(false);
              }}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={creatingPost}
              className={`${
                creatingPost
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "bg-white text-gray-600 hover:text-black"
              } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
            >
              {creatingPost ? <LoadingDots /> : "CREATE CATEGORY"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        showModal={showBulkCreateModal}
        setShowModal={setShowBulkCreateModal}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            bulkCreatePosts(subdomain);
          }}
          className="inline-block w-full max-w-xl overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <div className="px-8">
            <h2 className="mb-6 text-2xl">Bulk Create Posts</h2>
            <div className="flex-start flex flex-col items-center space-y-4">
              <div className="text-start">
                <label>
                  Content JSON<span className="text-red-600">*</span>
                </label>
                <textarea
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="importJSON"
                  required
                  placeholder={JSON_PLACEHOLDER}
                  ref={categoriesJSONRef}
                  rows={16}
                />
                <span className="text-sm italic text-gray-700">
                  Validate JSON using a free tool like jsonlint.com
                </span>
              </div>
              <div className="flex w-full items-start">
                <select
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  value={bulkPostsCategory || ""}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    setBulkPostsCategory(categoryId);
                  }}
                >
                  <option value="">Select a category</option>
                  {categories?.map((category) => (
                    <option key={category?.id}>{category?.title}</option>
                  ))}
                </select>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <label className="text-sm hover:cursor-pointer" htmlFor="check">
                  Generate Content for Posts from Title
                </label>
                <input
                  className="ml-2 hover:cursor-pointer"
                  id="check"
                  name="check"
                  checked={bulkCreateContent}
                  onChange={() => setBulkCreateContent(!bulkCreateContent)}
                  type="checkbox"
                />
              </div>
              {bulkCreateContent && (
                <div className="text-start">
                  <label>Content Generating Prompt</label>
                  <select
                    className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                    name="importJSON"
                    onChange={(e) => {
                      const promptId = e.target.value;
                      setImportContentPrompt(promptId);
                    }}
                    value={importContentPrompt || ""}
                  >
                    <option value="">Prompt to Generate Post Content</option>
                    {prompts.map((prompt) => (
                      <option value={prompt.id} key={prompt.id}>
                        {prompt.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="mt-10 flex w-full items-center justify-between">
            <button
              type="button"
              className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-600 transition-all duration-150 ease-in-out hover:text-black focus:outline-none focus:ring-0"
              onClick={() => {
                setShowBulkCreateModal(false);
              }}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={creatingPost}
              className={`${
                creatingPost
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "bg-white text-gray-600 hover:text-black"
              } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
            >
              {creatingPost ? <LoadingDots /> : "CREATE POSTS"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await deletePost(deletingPostId);
          }}
          className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <h2 className=" mb-6 text-2xl">Delete Post</h2>
          <div className="mx-auto grid w-5/6 gap-y-4">
            <p className="mb-3 text-gray-600">
              Are you sure you want to delete your post:{" "}
              <b>{deletingPostTitle}</b>? This action is not reversible. Type in{" "}
              <span className="bg-slate-200 px-1">delete</span> to confirm.
            </p>
            <div className="flex-start flex items-center overflow-hidden rounded border border-gray-700">
              <input
                className="w-full rounded-none rounded-r-lg border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                type="text"
                name="name"
                placeholder="delete"
                pattern="delete"
              />
            </div>
          </div>
          <div className="mt-10 flex w-full items-center justify-between">
            <button
              type="button"
              className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-400 transition-all duration-150 ease-in-out hover:text-black focus:outline-none focus:ring-0"
              onClick={() => setShowDeleteModal(false)}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={deletingPost}
              className={`${
                deletingPost
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "bg-white text-gray-600 hover:text-black"
              } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
            >
              {deletingPost ? <LoadingDots /> : "DELETE POST"}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
