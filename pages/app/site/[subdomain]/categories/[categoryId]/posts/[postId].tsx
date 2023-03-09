import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";
import { useS3Upload } from "next-s3-upload";
import getSlug from "speakingurl";
import type { ChangeEvent } from "react";

import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import Modal from "@/components/Modal";
import { StatusIndicator } from "@/components/app/PostCard";
import Header from "@/components/Layout/Header";
import ContainerLoader from "@/components/app/ContainerLoader";
import Container from "@/components/Layout/Container";

import { useCategories, useCredits, usePost, usePrompts } from "@/lib/queries";
import { HttpMethod } from "@/types";

interface PostData {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  image: string;
}

const CONTENT_PLACEHOLDER = `Write some content. Markdown supported:

# A H1 header

## A H2 header

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, and **bold**. Itemized lists look like:

  * this one
  * that one
  * the other one

Ordered lists look like:

  1. first item
  2. second item
  3. third item

> Block quotes are written like so.
>
> They can span multiple paragraphs,
> if you like.
`;

export default function Post() {
  const { data: session } = useSession();
  const router = useRouter();
  const postSlugRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<any>();
  const [imageData, setImageData] = useState<any>();
  const { FileInput, uploadToS3 } = useS3Upload();
  const [publishing, setPublishing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [generateInput, setGenerateInput] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [promptVariable, setPromptVariable] = useState("");

  const { subdomain, categoryId, postId } = router.query;
  const sessionUser = session?.user?.name;

  const { post, isLoading, mutatePost } = usePost(postId);

  const { categories } = useCategories(subdomain);
  const { prompts } = usePrompts();
  const { mutateCredits } = useCredits();

  const [data, setData] = useState<PostData>({
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    image: "",
  });

  useEffect(() => {
    if (post)
      setData({
        title: post.title ?? "",
        slug: post.slug ?? "",
        content: post.content ?? "",
        categoryId: post.categoryId ?? "",
        image: post.image ?? "",
      });
  }, [post, categoryId]);

  useEffect(() => {
    if (data.title && data.slug && data.content && !publishing)
      setDisabled(false);
    else setDisabled(true);
  }, [publishing, data]);

  const uploadImage = async (file) => {
    const path = `${sessionUser}/${subdomain}/${data.categoryId}/${postId}`;

    const { url } = await uploadToS3(file, {
      endpoint: {
        request: {
          body: {
            path,
          },
        },
      },
    });
    return url;
  };

  async function draft() {
    if (!postId || !data.title || !data.slug || !data.content || !categoryId)
      return toast.error("Make sure the post has required data");

    setDrafting(true);
    let imageUrl;

    if (imageData) {
      imageUrl = await uploadImage(imageData);
    }

    try {
      const response = await fetch(`/api/post`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: postId,
          title: data.title,
          slug: data.slug,
          content: data.content,
          image: imageUrl,
          categoryId: categoryId,
          published: false,
        }),
      });

      if (response.ok) {
        mutatePost();
        toast.success("Draft succesfully saved");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDrafting(false);
    }
  }

  async function publish() {
    if (!postId || !data.title || !data.slug || !data.content || !categoryId)
      return toast.error("Make sure the post has required data");

    setPublishing(true);
    let imageUrl;

    if (imageData) {
      imageUrl = await uploadImage(imageData);
    }

    try {
      const response = await fetch(`/api/post`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: postId,
          title: data.title,
          slug: data.slug,
          content: data.content,
          categoryId: categoryId,
          image: imageUrl,
          published: true,
        }),
      });

      if (response.ok) {
        mutatePost();
        router.push(`/site/${subdomain}/categories/${categoryId}/posts`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPublishing(false);
    }
  }

  const handleImageSelect = async (file) => {
    const imagePreviewSrc = URL.createObjectURL(file);

    setImagePreview(imagePreviewSrc);
    return setImageData(file);
  };

  const generateSlug = (e) => {
    const title = data.title;
    const slug = getSlug(title);

    if (!postSlugRef?.current) return;
    return setData({
      ...data,
      slug: slug,
    });
  };

  const handleGenerate = async () => {
    if (!generateInput || !selectedPrompt) return;
    setGeneratingResponse(true);

    try {
      const response = await fetch(`/api/prompt/generate`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptVariable,
          promptId: selectedPrompt,
        }),
      });

      if (response.ok) {
        const body = await response.json();

        if (generateInput === "description") {
          setData({
            ...data,
            content: body,
          });
        }
        toast.success("Prompt executed successfully");
      }
    } catch (e) {
      console.error(e);
    } finally {
      mutateCredits();
      setGeneratingResponse(false);
      setShowGenerateModal(false);
    }
  };

  return (
    <>
      <Layout>
        <Header>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl">Edit Post</h1>
            <button
              onClick={async () => {
                await publish();
              }}
              title={
                disabled
                  ? "Post must have a title, description, category and a slug to be published."
                  : "Publish"
              }
              disabled={disabled}
              className={`ml-4 ${
                disabled
                  ? "cursor-not-allowed border-gray-300 bg-gray-300"
                  : "border-black bg-black hover:bg-white hover:text-black"
              } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
            >
              {publishing ? <LoadingDots /> : "Publish  →"}
            </button>
          </div>
        </Header>
        {isLoading ? (
          <ContainerLoader />
        ) : (
          <>
            <Container className="pb-24">
              <TextareaAutosize
                name="title"
                onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setData({
                    ...data,
                    title: (e.target as HTMLTextAreaElement).value,
                  })
                }
                className="mb-2 w-full resize-none border-t-0 border-l-0 border-r-0 border-b px-2 py-4 text-4xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
                placeholder="Untitled Category"
                value={data.title || ""}
                onBlur={generateSlug}
              />
              <div className="flex w-full space-x-4">
                <div className="flex w-full flex-col">
                  <p>Slug</p>
                  <input
                    className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                    name="slug"
                    required
                    placeholder="Post Slug"
                    ref={postSlugRef}
                    type="text"
                    value={data.slug}
                    onChange={(e) =>
                      setData({
                        ...data,
                        slug: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                </div>
                <div className="flex w-full flex-col">
                  <p>Category</p>
                  <div className="flex w-full max-w-lg items-center overflow-hidden rounded border border-gray-700">
                    <select
                      onChange={(e) =>
                        setData((data) => ({
                          ...data,
                          categoryId: (e.target as HTMLSelectElement).value,
                        }))
                      }
                      value={data.categoryId || categoryId || ""}
                      className="w-full rounded-none border-none  bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    >
                      <option value="" disabled>
                        Select a Category
                      </option>
                      {categories &&
                        categories?.map((category) => (
                          <option value={category.id} key={category.id}>
                            {category.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col items-end">
                <h2 className="mr-auto text-xl">
                  Content<span className="text-red-600">*</span>
                </h2>
                <TextareaAutosize
                  name="content"
                  onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setData({
                      ...data,
                      content: (e.target as HTMLTextAreaElement).value,
                    })
                  }
                  minRows={6}
                  className="mb-3 w-full resize-none rounded border-gray-400 px-2 py-3 text-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
                  placeholder={CONTENT_PLACEHOLDER}
                  value={data.content}
                />
                <div className="flex">
                  <select
                    onChange={(e) => {
                      setSelectedPrompt(e.target.value);
                      setGenerateInput("description");
                    }}
                    value={selectedPrompt}
                  >
                    <option value="" disabled>
                      Select a Prompt
                    </option>
                    {prompts?.map((prompt) => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="flex items-center whitespace-nowrap border border-black bg-black px-3 py-1 tracking-wide text-white duration-200 hover:border hover:bg-white hover:text-black"
                    onClick={() => setShowGenerateModal(true)}
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex items-end space-x-6">
                <div className="w-full max-w-lg">
                  <p>Category Image</p>
                  <div
                    className={`relative h-[480px] w-[480px] ${
                      data.image ? "" : "h-150 animate-pulse bg-gray-300"
                    } relative w-full overflow-hidden rounded border-2 border-dashed border-gray-800`}
                  >
                    <FileInput
                      className="fileUpload absolute left-0 top-0 bottom-0 right-0 z-50 cursor-pointer opacity-0"
                      onChange={handleImageSelect}
                    />
                    {(imagePreview || data.image) && (
                      <Image
                        src={imagePreview || data.image}
                        alt="Upload Category Image"
                        width={800}
                        height={500}
                        placeholder="blur"
                        className="h-full w-full cursor-pointer rounded object-contain"
                        blurDataURL={imagePreview || data.image}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Container>
            <footer className="z-5 fixed inset-x-0 bottom-0 h-20 border-t border-solid border-gray-500 bg-white">
              <div className="mx-auto flex h-full max-w-screen-lg items-center justify-between">
                <div className="text-sm">
                  <strong>
                    <p>{post?.published ? "Published" : "Draft"}</p>
                  </strong>
                </div>
                <button
                  onClick={async () => {
                    await draft();
                  }}
                  title="Draft"
                  disabled={drafting}
                  className={`ml-auto ${
                    drafting
                      ? "cursor-not-allowed border-gray-300 bg-gray-300"
                      : "border-black bg-black hover:bg-white hover:text-black"
                  } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
                >
                  {drafting ? <LoadingDots /> : "Draft"}
                </button>
                <button
                  onClick={async () => {
                    await publish();
                  }}
                  title={
                    disabled
                      ? "Post must have a title, description, and content to be published."
                      : "Publish"
                  }
                  disabled={disabled}
                  className={`${
                    disabled
                      ? "cursor-not-allowed border-gray-300 bg-gray-300"
                      : "border-black bg-black hover:bg-white hover:text-black"
                  } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
                >
                  {publishing ? <LoadingDots /> : "Publish  →"}
                </button>
                <StatusIndicator
                  className="relative right-0"
                  published={post?.published}
                />
              </div>
            </footer>
          </>
        )}
        <Modal
          showModal={showGenerateModal}
          setShowModal={setShowGenerateModal}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleGenerate();
            }}
            className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
          >
            <div className="px-8">
              <h2 className="mb-6 text-2xl">Use Prompt</h2>
              <div className="flex-start flex flex-col items-center space-y-4">
                <div className="flex w-full flex-col">
                  <label className="mb-1 text-start" htmlFor="name">
                    Prompt Name
                  </label>
                  <input
                    id="name"
                    className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                    name="name"
                    required
                    value={
                      prompts?.find((prompt) => prompt.id === selectedPrompt)
                        ?.name || ""
                    }
                    readOnly
                    type="text"
                  />
                </div>
                <div className="flex w-full flex-col">
                  <label className="mb-1 text-start" htmlFor="name">
                    Prompt Command
                  </label>
                  <textarea
                    className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                    name="command"
                    required
                    value={
                      prompts?.find((prompt) => prompt.id === selectedPrompt)
                        ?.command || ""
                    }
                    readOnly
                    rows={8}
                  />
                </div>
                <div className="flex w-full flex-col">
                  <label className="mb-1 text-start" htmlFor="name">
                    Your Input
                  </label>
                  <input
                    className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                    name="hint"
                    required
                    placeholder={
                      prompts?.find((prompt) => prompt.id === selectedPrompt)
                        ?.hint || ""
                    }
                    onChange={(e) => setPromptVariable(e.target.value)}
                    type="text"
                  />
                </div>
              </div>
            </div>
            <div className="mt-10 flex w-full items-center justify-between">
              <button
                type="button"
                className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-600 transition-all duration-200 ease-in-out hover:text-black focus:outline-none focus:ring-0"
                onClick={() => {
                  setShowGenerateModal(false);
                }}
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={generatingResponse}
                className={`${
                  generatingResponse
                    ? "cursor-not-allowed bg-gray-50 text-gray-400"
                    : "bg-white text-gray-600 hover:text-black"
                } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-0`}
              >
                {generatingResponse ? <LoadingDots /> : "GENERATE RESPONSE"}
              </button>
            </div>
          </form>
        </Modal>
      </Layout>
    </>
  );
}
