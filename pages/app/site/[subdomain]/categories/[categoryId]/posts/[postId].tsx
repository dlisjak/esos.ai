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
import {
  useCategories,
  usePost,
  usePostTranslations,
  useSupportedLanguages,
} from "@/lib/queries";
import ContainerLoader from "@/components/app/ContainerLoader";
import TextEditor from "@/components/TextEditor";
import TitleEditor from "@/components/TitleEditor";
import { Image as ImageType, PostLink, PostTranslation } from "@prisma/client";
import Modal from "@/components/Modal";
import { PER_TRANSLATION } from "@/lib/consts/credits";

interface PostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  image: ImageType | null;
  links: PostLink[] | null;
}

export default function Post() {
  const postSlugRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<any>();
  const [imageData, setImageData] = useState<any>();
  const { FileInput, uploadToS3 } = useS3Upload();
  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [translatingPost, setTranslatingPost] = useState(false);
  const [addLinkValue, setAddLinkValue] = useState("");

  const router = useRouter();
  const { subdomain, postId } = router.query;

  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const { translations, mutateTranslations } = usePostTranslations(postId);
  const [selectedTranslation, setSelectedTranslation] =
    useState<PostTranslation | null>(null);
  const [selectedTranslationLang, setSelectedTranslationLang] = useState<
    string | null
  >(null);

  const { languages } = useSupportedLanguages();
  const { data: session } = useSession();
  const sessionUser = session?.user?.name;

  const { post, isLoading, mutatePost } = usePost(postId);

  const { categories } = useCategories(subdomain);

  const [data, setData] = useState<PostData>({
    id: "",
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    image: null,
    links: null,
  });

  useEffect(() => {
    if (post) {
      setSelectedTranslation(post?.translations[0] ?? null);
    }
  }, [post]);

  useEffect(() => {
    if (post && selectedTranslation) {
      return setData({
        id: post.id ?? "",
        slug: post.slug ?? "",
        categoryId: post.categoryId ?? "",
        image: post.image ?? null,
        links: post.links ?? null,
        title: selectedTranslation?.title || post.title || "",
        content: selectedTranslation?.content || post.content || "",
      });
    }
  }, [selectedTranslation]);

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

  const uploadImage = async (file: any, alt: any) => {
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

    return { src: url, alt };
  };

  async function publishTranslation() {
    if (!selectedTranslation) {
      return setPublishing(false);
    }

    const body: any = {
      translationId: selectedTranslation.id,
      title: data.title,
      content: data.content,
    };

    try {
      const response = await fetch(`/api/post/translate`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Successfuly Published Translation!");
        mutateTranslations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  }

  async function publish(published = true, redirect = false) {
    if (
      !postId ||
      !data.title ||
      !data.slug ||
      !data.content ||
      !data.categoryId
    )
      return toast.error("Make sure the post has required data");

    setPublishing(true);
    await publishTranslation();

    let image;

    if (imageData) {
      image = await uploadImage(imageData, data.title);
    } else {
      image = data.image;
    }

    const postTitle =
      selectedTranslation?.lang === "EN"
        ? data.title
        : translations.find((translation) => translation.lang === "EN")?.title;

    try {
      const response = await fetch(`/api/post`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: postId,
          slug: data.slug,
          categoryId: data.categoryId,
          title: postTitle,
          published,
          image,
          subdomain,
        }),
      });

      if (response.ok) {
        toast.success("Successfuly Published Post!");
        mutatePost();

        if (redirect) {
          router.push(
            `${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://app.${process.env.NEXT_PUBLIC_DOMAIN_URL}/site/${subdomain}/posts`
          );
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPublishing(false);
    }
  }

  const handleImageSelect = async (file: any) => {
    const imagePreviewSrc = URL.createObjectURL(file);

    setImagePreview(imagePreviewSrc);
    return setImageData(file);
  };

  const handleSetContent = (value: any) => {
    setData({
      ...data,
      content: value,
    });
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

  async function translatePost() {
    setTranslatingPost(true);
    await publishTranslation();

    try {
      const createTranslationResponse = await fetch(
        `/api/post/translate?subdomain=${subdomain}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: HttpMethod.POST,
          body: JSON.stringify({
            lang: selectedTranslationLang,
            postId,
          }),
        }
      );

      const translation = await createTranslationResponse.json();

      const res = await fetch(`/api/post/translate?postId=${postId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: HttpMethod.PUT,
        body: JSON.stringify({
          translationId: translation.id,
          lang: translation.lang,
          title: data?.title,
          content: data?.content,
        }),
      });

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
      setTranslatingPost(false);
      mutateTranslations();
    }
  }

  const handleAddLink = async () => {
    if (!postId || !addLinkValue || !data.slug) return;

    try {
      const res = await fetch(`/api/post/link`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: HttpMethod.POST,
        body: JSON.stringify({
          postId,
          title: addLinkValue,
          href: data.slug,
        }),
      });

      if (res.ok) {
        toast.success("Added a New Post Link");
        mutatePost();
      }
    } catch (err) {
      toast.error("Seems there was an error. Please contact support.");
      console.error(err);
    } finally {
      setAddLinkValue("");
    }
  };

  const handleRemovePostLink = async (linkId: string) => {
    if (!linkId) return;

    try {
      const res = await fetch(`/api/post/link`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: HttpMethod.DELETE,
        body: JSON.stringify({
          postId,
          linkId,
        }),
      });

      if (res.ok) {
        toast.success("Removed a Post Link");
        mutatePost();
      }
    } catch (err) {
      toast.error("Seems there was an error. Please contact support.");
      console.error(err);
    }
  };

  const handleInterLinkPosts = async (linkId: string) => {
    if (!linkId) return;

    try {
      const res = await fetch(`/api/post/link`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: HttpMethod.PUT,
        body: JSON.stringify({
          subdomain,
          postId,
          linkId,
          categoryId: post.categoryId,
        }),
      });

      if (res.ok) {
        toast.success("Removed a Post Link");
        mutatePost();
      }
    } catch (err) {
      toast.error("Seems there was an error. Please contact support.");
      console.error(err);
    }
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
                  className={`relative relative h-[480px] w-[480px] w-full overflow-hidden rounded border-2 border-dashed border-gray-800`}
                >
                  <FileInput
                    className="fileUpload absolute left-0 top-0 bottom-0 right-0 z-50 cursor-pointer opacity-0"
                    onChange={handleImageSelect}
                  />
                  <Image
                    src={imagePreview || data.image?.src || "/placeholder.png"}
                    alt={data.image?.alt ?? ""}
                    width={480}
                    height={480}
                    className="h-full w-full cursor-pointer rounded object-contain"
                  />
                </div>
              </div>
              <div className="relative w-full">
                <div className="flex justify-between">
                  <h2 className="mr-auto text-xl">
                    Links({data?.links?.length})
                  </h2>
                </div>
                <div className="sticky top-0 w-full rounded border">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleAddLink();
                    }}
                  >
                    <input
                      className="w-full rounded border"
                      placeholder="Write Your Anchor Text and Press Enter key"
                      onChange={(e) => setAddLinkValue(e.target.value)}
                      value={addLinkValue}
                      type="text"
                      required
                    />
                  </form>
                </div>
                <ul className="relative h-[440px] w-full overflow-y-scroll rounded border">
                  {data?.links?.map((link) => (
                    <li
                      className="flex items-center justify-between border-b px-4 py-2"
                      key={link.id}
                    >
                      <div>
                        <b>Text:</b> {link.title}
                      </div>
                      <button
                        className="ml-auto mr-2 flex items-center whitespace-nowrap border bg-white bg-white px-2 py-1 tracking-wide text-black text-gray-600 duration-200 hover:border-black hover:text-black"
                        onClick={() => handleInterLinkPosts(link.id)}
                      >
                        Interlink
                      </button>
                      <button
                        className="flex whitespace-nowrap bg-red-400 px-3 py-1 tracking-wide text-white duration-200 hover:bg-red-500"
                        onClick={() => handleRemovePostLink(link.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
          <footer className="z-5 fixed inset-x-0 bottom-0 h-20 border-t border-solid border-gray-500 bg-white">
            <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between">
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
                  await publish(true, false);
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
                {publishing ? <LoadingDots /> : "Save"}
              </button>
              <button
                onClick={async () => {
                  await publish(true, true);
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
                {publishing ? <LoadingDots /> : "Save & Exit →"}
              </button>
              <StatusIndicator
                className="relative right-0"
                published={post?.published}
              />{" "}
            </div>
          </footer>
          <Modal
            showModal={showTranslateModal}
            setShowModal={setShowTranslateModal}
          >
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await translatePost();
              }}
              className="inline-block w-full max-w-xl overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
            >
              <h2 className=" mb-6 text-2xl">Translate Post</h2>
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
              </div>
              <div className="mt-auto pt-4 text-sm italic">
                The cost of translating this article is{" "}
                <b>
                  {Math.ceil(data.content.length / PER_TRANSLATION)} credits
                </b>
              </div>
              <div className="mt-4 flex w-full items-center justify-between">
                <button
                  type="button"
                  className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-400 transition-all duration-150 ease-in-out hover:text-black focus:outline-none focus:ring-0"
                  onClick={() => setShowTranslateModal(false)}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={translatingPost}
                  className={`${
                    translatingPost
                      ? "cursor-not-allowed bg-gray-50 text-gray-400"
                      : "bg-white text-gray-600 hover:text-black"
                  } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
                >
                  {translatingPost ? <LoadingDots /> : "TRANSLATE POST"}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </Layout>
  );
}
