import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { useS3Upload } from "next-s3-upload";

import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import Modal from "@/components/Modal";
import TextEditor from "@/components/TextEditor";

import { HttpMethod } from "@/types";

import type { ChangeEvent } from "react";

import getSlug from "speakingurl";
import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";
import { useSession } from "next-auth/react";
import { useCategories, useCategory, usePrompts } from "@/lib/queries";
import Image from "next/image";
import ContainerLoader from "@/components/app/ContainerLoader";

interface CategoryData {
  id: string;
  title: string;
  description: string;
  slug: string;
  parentId: string;
  image: string;
}

export default function CategoryPage() {
  const router = useRouter();
  const categorySlugRef = useRef<HTMLInputElement | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<any>();
  const [imageData, setImageData] = useState<any>();
  const { FileInput, uploadToS3 } = useS3Upload();
  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const { subdomain, categoryId } = router.query;

  const { data: session } = useSession();
  const sessionUser = session?.user?.name;

  const { category, isLoading, mutateCategory } = useCategory(categoryId);

  const { categories } = useCategories(subdomain);
  const { prompts } = usePrompts();

  const [data, setData] = useState<CategoryData>({
    id: "",
    title: "",
    description: "",
    slug: "",
    parentId: "",
    image: "",
  });

  useEffect(() => {
    if (category)
      setData({
        id: category.id ?? "",
        title: category.title ?? "",
        description: category.description ?? "",
        parentId: category.parentId ?? "",
        slug: category.slug ?? "",
        image: category.image ?? "",
      });
  }, [category]);

  useEffect(() => {
    if (data.title && data.slug && data.description && !publishing)
      setDisabled(false);
    else setDisabled(true);
  }, [publishing, data]);

  const uploadImage = async (file) => {
    const path = `${sessionUser}/${subdomain}/${data.id}`;

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

  async function publish() {
    setPublishing(true);
    let imageUrl;

    if (imageData) {
      imageUrl = await uploadImage(imageData);
    }

    try {
      const response = await fetch(`/api/category`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: categoryId,
          title: data.title,
          description: data.description,
          slug: data.slug,
          parentId: data.parentId,
          image: imageUrl,
        }),
      });

      if (response.ok) {
        toast.success("Successfuly Published Category!");
        mutateCategory();
        router.push(`/site/${subdomain}/categories`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPublishing(false);
    }
  }

  async function deleteCategory(categoryId: string) {
    setDeletingCategory(true);

    try {
      const res = await fetch(`/api/category?categoryId=${categoryId}`, {
        method: HttpMethod.DELETE,
      });

      if (res.ok) {
        toast.success(`Category Deleted`);
        setTimeout(() => {
          router.push(`/site/${subdomain}/categories`);
        }, 100);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingCategory(false);
    }
  }

  const handleImageSelect = async (file) => {
    const imagePreviewSrc = URL.createObjectURL(file);

    setImagePreview(imagePreviewSrc);
    return setImageData(file);
  };

  const generateSlug = () => {
    const title = data.title;
    const slug = getSlug(title);

    if (!categorySlugRef?.current) return;

    return setData({
      ...data,
      slug: slug,
    });
  };

  const handleSetDescription = (value) => {
    setData({
      ...data,
      description: value,
    });
  };

  return (
    <Layout>
      <Header className="">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Edit Category</h1>
          <button
            onClick={async () => {
              await publish();
            }}
            title={
              disabled
                ? "Category must have a title, description, and a slug to be published."
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
            <div className="mb-4 flex items-center">
              <TextareaAutosize
                name="title"
                onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setData({
                    ...data,
                    title: (e.target as HTMLTextAreaElement).value,
                  })
                }
                className="mb-2 w-full resize-none border-t-0 border-l-0 border-r-0 border-b px-2 py-4 text-5xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
                placeholder="Untitled Category"
                value={data.title || ""}
                onBlur={generateSlug}
              />
            </div>
            <div className="flex w-full space-x-4">
              <div className="flex w-full flex-col">
                <h2 className="text-xl">
                  Slug<span className="text-red-600">*</span>
                </h2>
                <input
                  className="w-full max-w-[24rem] rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="slug"
                  required
                  placeholder="Category Slug"
                  ref={categorySlugRef}
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
                <h2 className="text-xl">Parent Category</h2>
                <div className="flex w-full max-w-lg items-center overflow-hidden rounded border border-gray-700">
                  <select
                    onChange={(e) =>
                      setData((data) => ({
                        ...data,
                        parentId: (e.target as HTMLSelectElement).value,
                      }))
                    }
                    value={data?.parentId || category?.parentId || ""}
                    className="w-full rounded-none border-none  bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                  >
                    <option value="">None</option>
                    {categories &&
                      categories?.map((category) => {
                        if (category.id === categoryId) return;
                        return (
                          <option value={category.id} key={category.id}>
                            {category.title}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-end">
              <h2 className="mr-auto text-xl">
                Description<span className="text-red-600">*</span>
              </h2>
              <TextEditor
                value={data.description}
                setValue={handleSetDescription}
              />
            </div>
            <div className="flex items-end space-x-6">
              <div className="w-full max-w-lg">
                <h2 className="text-xl">Category Image</h2>
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
              <div className="h-full w-full">
                <h2 className="text-2xl">Meta</h2>
                <div className="my-auto w-full rounded border"></div>
              </div>
            </div>
            <div className="mt-4 w-full space-y-2">
              <h2 className="text-2xl">Delete Category</h2>
              <p>
                Permanently delete the &quot;{data.title}&quot; category and all
                of its contents. This will also remove all the corresponding
                posts. This action is not reversible – please continue with
                caution.
              </p>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                }}
                className="max-w-max rounded border border-solid border-red-500 bg-red-500 px-5 py-3  text-white transition-all duration-150 ease-in-out hover:bg-white hover:text-red-500 focus:outline-none"
              >
                Delete Category
              </button>
            </div>
          </Container>
          <footer className="z-5 fixed inset-x-0 bottom-0 h-20 border-t border-solid border-gray-500 bg-white">
            <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-10 sm:px-20">
              <p>
                {disabled &&
                  !publishing &&
                  "Category must have a title, description, and a slug to be published."}
              </p>
              <button
                onClick={async () => {
                  await publish();
                }}
                title={
                  disabled
                    ? "Category must have a title, description, and a slug to be published."
                    : "Publish"
                }
                disabled={disabled}
                className={`ml-auto ${
                  disabled
                    ? "cursor-not-allowed border-gray-300 bg-gray-300"
                    : "border-black bg-black hover:bg-white hover:text-black"
                } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
              >
                {publishing ? <LoadingDots /> : "Publish  →"}
              </button>
            </div>
          </footer>
          <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await deleteCategory(data?.id as string);
              }}
              className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
            >
              <h2 className=" mb-6 text-2xl">Delete Category</h2>
              <div className="mx-auto grid w-5/6 gap-y-4">
                <p className="mb-3 text-gray-600">
                  Are you sure you want to delete your category:{" "}
                  <b>{data.title}</b>? This action is not reversible. Type in{" "}
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
                  disabled={deletingCategory}
                  className={`${
                    deletingCategory
                      ? "cursor-not-allowed bg-gray-50 text-gray-400"
                      : "bg-white text-gray-600 hover:text-black"
                  } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
                >
                  {deletingCategory ? <LoadingDots /> : "DELETE CATEGORY"}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </Layout>
  );
}
