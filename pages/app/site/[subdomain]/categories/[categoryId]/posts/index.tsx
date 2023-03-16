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
import Header from "@/components/Layout/Header";
import Container from "@/components/Layout/Container";
import { useCategory } from "@/lib/queries";
import ContainerLoader from "@/components/app/ContainerLoader";

export default function CategoryPosts() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const postTitleRef = useRef<HTMLInputElement | null>(null);
  const postSlugRef = useRef<HTMLInputElement | null>(null);
  const [deletingPostId, setDeletingPostId] = useState();
  const [deletingPostTitle, setDeletingPostTitle] = useState();
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const router = useRouter();
  const { subdomain, categoryId } = router.query;

  const { category, isLoading, mutateCategory } = useCategory(categoryId);

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
        toast.success(`Post Created`);
        setTimeout(() => {
          router.push(
            `/site/${subdomain}/categories/${categoryId}/posts/${data.postId}`
          );
        }, 100);
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
        mutateCategory();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingPost(false);
      setShowDeletePostModal(false);
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
    setShowDeletePostModal(true);
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
        mutateCategory();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Posts for {category?.title}</h1>
          <AddNewButton
            onClick={() => {
              setShowModal(true);
            }}
          >
            Add Post <span className="ml-2">＋</span>
          </AddNewButton>
        </div>
      </Header>
      <Container dark>
        {isLoading ? (
          <ContainerLoader />
        ) : (
          <div className="grid gap-y-4">
            {category && category?.posts && category?.posts?.length > 0 ? (
              category.posts?.map((post) => (
                <PostCard
                  post={post}
                  postEditUrl={`/site/${subdomain}/categories/${category.id}/posts/${post.id}`}
                  subdomain={subdomain}
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
        showModal={showDeletePostModal}
        setShowModal={setShowDeletePostModal}
      >
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
              onClick={() => setShowDeletePostModal(false)}
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
