import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { useS3Upload } from "next-s3-upload";
import { useSession } from "next-auth/react";
import Image from "next/image";

import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import { StatusIndicator } from "@/components/app/PostCard";
import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";

import { HttpMethod } from "@/types";
import { useCategories, usePost } from "@/lib/queries";
import ContainerLoader from "@/components/app/ContainerLoader";
import TextEditor from "@/components/TextEditor";
import TitleEditor from "@/components/TitleEditor";
import { Image as ImageType } from "@prisma/client";

interface PostData {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  image: ImageType | null;
}

export default function Post() {
  const postSlugRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<any>();
  const [imageData, setImageData] = useState<any>();
  const { FileInput, uploadToS3 } = useS3Upload();
  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const router = useRouter();

  const { subdomain, postId } = router.query;

  const { data: session } = useSession();
  const sessionUser = session?.user?.name;

  const { post, isLoading, mutatePost } = usePost(postId);

  const { categories } = useCategories(subdomain);

  const [data, setData] = useState<PostData>({
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    image: null,
  });

  useEffect(() => {
    if (post)
      setData({
        title: post.title ?? "",
        slug: post.slug ?? "",
        content: post.content ?? "",
        categoryId: post.categoryId ?? "",
        image: post.image ?? { id: "", src: "", alt: "" },
      });
  }, [post]);

  useEffect(() => {
    if (
      data.title &&
      data.slug &&
      data.content &&
      data.categoryId &&
      !publishing
    )
      setDisabled(false);
    else setDisabled(true);
  }, [publishing, data]);

  const uploadImage = async (file) => {
    const path = `${sessionUser}/${subdomain}/${file.name}`;

    const { url } = await uploadToS3(file, {
      endpoint: {
        request: {
          body: {
            path,
          },
        },
      },
    });

    const res = await fetch(`/api/imageAlt?imageUrl=${url}`);
    const alt = await res.json();

    return { src: url, alt };
  };

  async function publish(published = true) {
    if (
      !postId ||
      !data.title ||
      !data.slug ||
      !data.content ||
      !data.categoryId
    )
      return toast.error("Make sure the post has required data");

    setPublishing(true);
    let image;

    if (imageData) {
      image = await uploadImage(imageData);
    } else {
      image = data.image;
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
          categoryId: data.categoryId,
          published,
          image,
        }),
      });

      if (response.ok) {
        mutatePost();
        router.push(
          `${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://app.${process.env.NEXT_PUBLIC_DOMAIN_URL}/site/${subdomain}/posts`
        );
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

  const handleSetContent = (value) => {
    setData({
      ...data,
      content: value,
    });
  };

  const handleSetTitle = (value) => {
    setData({
      ...data,
      title: value,
    });
  };

  const handleSetSlug = (value) => {
    setData({
      ...data,
      slug: value,
    });
  };

  return (
    <Layout>
      <Header>
        <h1 className="text-4xl">Edit Post</h1>
      </Header>
      {isLoading ? (
        <ContainerLoader />
      ) : (
        <>
          <Container className="pb-24">
            <TitleEditor
              value={data.title}
              setValue={handleSetTitle}
              setSlug={handleSetSlug}
            />
            <div className="flex w-full space-x-4">
              <div className="flex w-full flex-col">
                <h2 className="mr-auto text-xl">
                  Slug<span className="text-red-600">*</span>
                </h2>
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
                <h2 className="mr-auto text-xl">
                  Category<span className="text-red-600">*</span>
                </h2>
                <div className="flex w-full max-w-lg items-center overflow-hidden rounded border border-gray-700">
                  <select
                    onChange={(e) =>
                      setData((data) => ({
                        ...data,
                        categoryId: (e.target as HTMLSelectElement).value,
                      }))
                    }
                    value={data.categoryId || post?.categoryId || ""}
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
            <div className="mt-4 flex flex-col items-end">
              <h2 className="mr-auto text-xl">
                Content<span className="text-red-600">*</span>
              </h2>
              <TextEditor
                value={data.content}
                setValue={handleSetContent}
                dataId={postId}
              />
            </div>
            <div className="flex items-end space-x-6">
              <div className="w-full max-w-lg">
                <h2 className="mr-auto text-xl">Image</h2>
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
                      src={
                        imagePreview || data.image?.src || "/placeholder.png"
                      }
                      alt={data.image?.alt ?? ""}
                      width={480}
                      height={480}
                      className="h-full w-full cursor-pointer rounded object-contain"
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
                  await publish(false);
                }}
                title="Draft"
                disabled={publishing}
                className={`ml-auto ${
                  publishing
                    ? "cursor-not-allowed border-gray-300 bg-gray-300"
                    : "border-black bg-black hover:bg-white hover:text-black"
                } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
              >
                {publishing ? <LoadingDots /> : "Draft"}
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
              />{" "}
            </div>
          </footer>
        </>
      )}
    </Layout>
  );
}
