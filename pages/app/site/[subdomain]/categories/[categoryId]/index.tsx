import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { useS3Upload } from "next-s3-upload";

import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import Modal from "@/components/Modal";
import TextEditor from "@/components/TextEditor";

import { HttpMethod } from "@/types";

import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";
import { useSession } from "next-auth/react";
import {
  useCategories,
  useCategory,
  useCategoryTranslations,
  useSupportedLanguages,
} from "@/lib/queries";
import Image from "next/image";
import ContainerLoader from "@/components/app/ContainerLoader";
import TitleEditor from "@/components/TitleEditor";
import { CategoryTranslation, Image as ImageType } from "@prisma/client";

interface CategoryData {
  id: string;
  title: string;
  slug: string;
  parentId: string;
  image: ImageType | null;
}

export default function CategoryPage() {
  const categorySlugRef = useRef<HTMLInputElement | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [translatingCategory, setTranslatingCategory] = useState(false);
  const [imagePreview, setImagePreview] = useState<any>();
  const [imageData, setImageData] = useState<any>();
  const { FileInput, uploadToS3 } = useS3Upload();
  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [showTranslateModal, setShowTranslateModal] = useState(false);

  const { data: session } = useSession();
  const sessionUser = session?.user?.name;

  const router = useRouter();
  const { subdomain, categoryId } = router.query;
  const { categories } = useCategories(subdomain);
  const { category, isLoading, mutateCategory } = useCategory(categoryId);

  const { languages } = useSupportedLanguages();
  const { translations, mutateTranslations } =
    useCategoryTranslations(categoryId);
  const [selectedTranslation, setSelectedTranslation] =
    useState<CategoryTranslation | null>(null);
  const [selectedTranslationLang, setSelectedTranslationLang] = useState<
    string | null
  >(null);

  const [content, setContent] = useState("");
  const [data, setData] = useState<CategoryData>({
    id: "",
    title: "",
    slug: "",
    parentId: "",
    image: null,
  });

  useEffect(() => {
    if (category) {
      setSelectedTranslation(category?.translations[0] ?? null);
    }
  }, [category]);

  useEffect(() => {
    if (category && selectedTranslation) {
      setData({
        id: category.id ?? "",
        parentId: category.parentId ?? "",
        slug: category.slug ?? "",
        image: category.image ?? null,
        title: selectedTranslation?.title || category?.title || "",
      });

      return setContent(
        selectedTranslation?.content || category?.content || ""
      );
    }
  }, [selectedTranslation]);

  useEffect(() => {
    if (data.title && data.slug && content && !publishing) setDisabled(false);
    else setDisabled(true);
  }, [publishing, data, content]);

  const uploadImage = async (file: any, title: any) => {
    const path = `${sessionUser}/${subdomain}`;

    const { url } = await uploadToS3(file, {
      endpoint: {
        request: {
          body: {
            path,
          },
        },
      },
    });

    return { src: url, alt: title };
  };

  async function publishTranslation() {
    if (!selectedTranslation) {
      return setPublishing(false);
    }

    const body: any = {
      translationId: selectedTranslation.id,
      title: data.title,
      content: content,
    };

    try {
      const response = await fetch(`/api/category/translate`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Successfuly Published Translation!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  }

  async function publish(redirect = false) {
    setPublishing(true);
    await publishTranslation();
    let image;

    const postTitle =
      selectedTranslation?.lang === "EN"
        ? data.title
        : translations.find((translation) => translation.lang === "EN")?.title;

    const body: any = {
      id: categoryId,
      title: postTitle,
      slug: data.slug,
      parentId: data.parentId,
    };

    if (imageData) {
      image = await uploadImage(imageData, data.title);
      body["image"] = image;
    }

    try {
      const response = await fetch(`/api/category`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Successfuly Published Category!");
        mutateTranslations();
        mutateCategory();

        if (redirect) {
          router.push(`/site/${subdomain}/categories`);
        }
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

  const handleImageSelect = async (file: any) => {
    const imagePreviewSrc = URL.createObjectURL(file);

    setImagePreview(imagePreviewSrc);
    return setImageData(file);
  };

  const handleSetTitle = (value: any) => {
    setData({
      ...data,
      title: value,
    });
  };

  const handleSetSlug = (value: any) => {
    setData({
      ...data,
      slug: value,
    });
  };

  async function translateCategory() {
    setTranslatingCategory(true);
    await publishTranslation();

    try {
      const createTranslationResponse = await fetch(
        `/api/category/translate?subdomain=${subdomain}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: HttpMethod.POST,
          body: JSON.stringify({
            lang: selectedTranslationLang,
            categoryId,
          }),
        }
      );

      const translation = await createTranslationResponse.json();

      const res = await fetch(
        `/api/category/translate?categoryId=${categoryId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: HttpMethod.PUT,
          body: JSON.stringify({
            translationId: translation.id,
            lang: translation.lang,
            title: data?.title,
            content: content,
          }),
        }
      );

      if (res.ok) {
        toast.success(`Translation Created`);
        const body = await res.json();
        setSelectedTranslation(body);
      }
    } catch (error) {
      console.error(error);
      toast.error("Creating Translation failed. Check if translation exists");
    } finally {
      setShowTranslateModal(false);
      setTranslatingCategory(false);
      mutateTranslations();
    }
  }

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Edit Category</h1>
          <button
            onClick={async () => {
              await publish(true);
            }}
            title={
              disabled
                ? "Category must have a title, content, and a slug to be published."
                : "Publish"
            }
            disabled={disabled}
            className={`ml-4 ${
              disabled
                ? "cursor-not-allowed border-gray-300 bg-gray-300"
                : "border-black bg-black hover:bg-white hover:text-black"
            } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
          >
            {publishing ? <LoadingDots /> : "Save & Exit →"}
          </button>
        </div>
      </Header>
      {isLoading ? (
        <ContainerLoader />
      ) : (
        <>
          <Container className="pb-24" innerContainerClassNames="pt-0">
            <div className="mb-8 flex w-full rounded border-x border-b">
              <ul className="flex divide-x">
                <button
                  className="px-4"
                  onClick={() => setShowTranslateModal(true)}
                >
                  +
                </button>
                {translations?.map((translation) => (
                  <button
                    className={`px-4 py-2 duration-200 hover:bg-gray-200 ${
                      selectedTranslation?.lang === translation.lang
                        ? "bg-gray-200"
                        : ""
                    }`}
                    onClick={() => setSelectedTranslation(translation)}
                    key={translation.lang}
                  >
                    {translation.lang.toUpperCase()}
                  </button>
                ))}
              </ul>
            </div>
            <TitleEditor
              value={data.title}
              setValue={handleSetTitle}
              slug={data.slug}
              setSlug={handleSetSlug}
            />
            <div className="flex w-full space-x-4">
              <div className="flex w-full flex-col">
                <h2 className="text-xl">
                  Slug<span className="text-red-600">*</span>
                </h2>
                <input
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
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
                <div className="flex w-full items-center overflow-hidden rounded border border-gray-700">
                  <select
                    onChange={(e) =>
                      setData((data) => ({
                        ...data,
                        parentId: (e.target as HTMLSelectElement).value,
                      }))
                    }
                    value={data?.parentId || ""}
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
                Content<span className="text-red-600">*</span>
              </h2>
              <TextEditor
                content={content}
                setContent={setContent}
                dataId={categoryId}
              />
            </div>
            <div className="flex items-end space-x-6">
              <div className="w-full max-w-lg">
                <h2 className="text-xl">Category Image</h2>
                <div
                  className={`relative relative h-[480px] w-[480px] w-full overflow-hidden rounded border-2 border-dashed border-gray-800`}
                >
                  <FileInput
                    className="fileUpload absolute left-0 top-0 bottom-0 right-0 z-50 cursor-pointer opacity-0"
                    onChange={handleImageSelect}
                  />
                  <Image
                    src={imagePreview || data.image?.src || "/placeholder.png"}
                    alt={data.image?.alt ?? "Placeholder Alt"}
                    width={480}
                    height={480}
                    className="h-full w-full cursor-pointer rounded object-contain"
                  />
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
                  "Category must have a title, content, and a slug to be published."}
              </p>
              <button
                onClick={async () => {
                  await publish();
                }}
                title={
                  disabled
                    ? "Category must have a title, content, and a slug to be published."
                    : "Publish"
                }
                disabled={disabled}
                className={`ml-auto ${
                  disabled
                    ? "cursor-not-allowed border-gray-300 bg-gray-300"
                    : "border-black bg-black hover:bg-white hover:text-black"
                } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
              >
                {publishing ? <LoadingDots /> : "Save"}
              </button>
              <button
                onClick={async () => {
                  await publish(true);
                }}
                title={
                  disabled
                    ? "Category must have a title, content, and a slug to be published."
                    : "Publish"
                }
                disabled={disabled}
                className={`${
                  disabled
                    ? "cursor-not-allowed border-gray-300 bg-gray-300"
                    : "border-black bg-black hover:bg-white hover:text-black"
                } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
              >
                {publishing ? <LoadingDots /> : "Save & Exit  →"}
              </button>
            </div>
          </footer>
          <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await deleteCategory(data?.id as string);
              }}
              className="inline-block w-full max-w-xl overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
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
          <Modal
            showModal={showTranslateModal}
            setShowModal={setShowTranslateModal}
          >
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await translateCategory();
              }}
              className="inline-block w-full max-w-xl overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
            >
              <h2 className=" mb-6 text-2xl">Translate Category</h2>
              <div className="mx-auto grid w-5/6 gap-y-4">
                <p className="text-gray-left mb-3 text-start">
                  Choose which languages you want to add:
                </p>
                <div className="flex-start flex items-center overflow-hidden rounded border">
                  <select
                    className="w-full"
                    value={selectedTranslationLang || ""}
                    onChange={(e) => {
                      setSelectedTranslationLang(e.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Select a Language
                    </option>
                    {languages?.map(({ name, language }) => (
                      <option value={language} key={language}>
                        {name} ({language})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-auto pt-4 text-sm italic">
                  The cost of translating is{" "}
                  <b>{Math.ceil(content.length / 500)} credits</b>
                </div>
              </div>
              <div className="mt-10 flex w-full items-center justify-between">
                <button
                  type="button"
                  className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-400 transition-all duration-150 ease-in-out hover:text-black focus:outline-none focus:ring-0"
                  onClick={() => setShowTranslateModal(false)}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={translatingCategory}
                  className={`${
                    translatingCategory
                      ? "cursor-not-allowed bg-gray-50 text-gray-400"
                      : "bg-white text-gray-600 hover:text-black"
                  } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
                >
                  {translatingCategory ? <LoadingDots /> : "TRANSLATE CATEGORY"}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </Layout>
  );
}
