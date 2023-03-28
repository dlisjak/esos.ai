import { useRef, useState } from "react";
import { useRouter } from "next/router";
import getSlug from "speakingurl";
import { toast } from "react-hot-toast";

import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import Modal from "@/components/Modal";
import CategoryList from "@/components/app/CategoryList";

import { HttpMethod } from "@/types";

import AddNewButton from "@/components/app/AddNewButton";
import Header from "@/components/Layout/Header";
import Container from "@/components/Layout/Container";
import ContainerLoader from "@/components/app/ContainerLoader";
import { useCategories, usePrompts } from "@/lib/queries";

const JSON_PLACEHOLDER = `{
	"categories": [{
			"title": "Services",
			"children": [{
					"title": "Writing",
					"children": [
						"Resume Writing",
						"Grant Writing"
					]
				},
				{
					"title": "Design",
					"children": [
						"Landscape Design",
						"Fashion Design"
					]
				},
				{
					"title": "Tech",
					"children": [
						"Blockchain Development",
						"Cybersecurity"
					]
				},
				{
					"title": "Business",
					"children": [
						"PPC Advertising",
						"Public Relations"
					]
				},
				{
					"title": "Admin",
					"children": [
						"Support",
						"Live Chat"
					]
				},
				{
					"title": "Other",
					"children": [
						"Acting",
						" Modeling"
					]
				}
			]
		},
		{
			"title": "Platforms",
			"children": [
				"Kolabtree",
				"Quickengigs"
			]
		},
		{
			"title": "Resources",
			"children": [
				"Tools & Software",
				"Workspace & Equipment"
			]
		}
	]
}`;

export default function SiteCategories() {
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [showImportCategoriesModal, setShowImportCategoriesModal] =
    useState<boolean>(false);
  const [showImportCategoriesPrompts, setShowImportCategoriesPrompts] =
    useState<boolean>(false);
  const [importContentPrompt, setImportContentPrompt] = useState<string>("");
  const [creatingCategory, setCreatingCategory] = useState<boolean>(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [creatingPostCategoryId, setCreatingPostCategoryId] = useState();
  const [deletingPostCategoryId, setDeletingPostCategoryId] = useState();
  const [deletingPostCategoryTitle, setDeletingPostCategoryTitle] = useState();
  const postTitleRef = useRef<HTMLInputElement | null>(null);
  const postSlugRef = useRef<HTMLInputElement | null>(null);
  const categoryTitleRef = useRef<HTMLInputElement | null>(null);
  const categorySlugRef = useRef<HTMLInputElement | null>(null);
  const categoriesJSONRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const { subdomain } = router.query;

  const { categories, isLoading, mutateCategories } = useCategories(subdomain);
  const { prompts } = usePrompts();

  async function createCategory(subdomain: string | string[] | undefined) {
    if (!subdomain) return;
    setCreatingCategory(true);
    if (!categoryTitleRef.current || !categorySlugRef.current) return;
    const title = categoryTitleRef.current.value;
    const slug = categorySlugRef.current.value;
    const data = { title, slug };

    try {
      const res = await fetch(`/api/category?subdomain=${subdomain}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const { categoryId } = await res.json();
        toast.success(`Category Created`);
        router.push(`/site/${subdomain}/categories/${categoryId}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingCategory(false);
    }
  }

  async function createPost(
    subdomain: string | string[] | undefined,
    categoryId: string | string[] | undefined
  ) {
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
        router.push(
          `/site/${subdomain}/categories/${categoryId}/posts/${data.postId}`
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingPost(false);
      setShowPostModal(false);
    }
  }

  async function importCategories(subdomain: string | string[] | undefined) {
    if (!subdomain) return;

    const { categories } = JSON.parse(categoriesJSONRef?.current?.value ?? "");

    const data = {
      subdomain,
      categories,
    };

    try {
      const res = await fetch(`/api/category/import`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(`Categories Imported`);
        mutateCategories();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setShowImportCategoriesModal(false);
    }
  }

  async function deleteCategory(categoryId: any) {
    if (!categoryId) return;
    setDeletingCategory(true);

    try {
      const res = await fetch(`/api/category?categoryId=${categoryId}`, {
        method: HttpMethod.DELETE,
      });

      if (res.ok) {
        toast.success(`Category Deleted`);
        mutateCategories();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingCategory(false);
      setShowDeleteModal(false);
    }
  }

  const generateSlug = (e: any) => {
    const title = e.target.value;
    const slug = getSlug(title);

    if (showCategoryModal) {
      if (!categorySlugRef?.current) return;
      categorySlugRef.current.value = slug;
    }

    if (showPostModal) {
      if (!postSlugRef?.current) return;
      postSlugRef.current.value = slug;
    }
  };

  const handleAddPostClick = (categoryId: any) => {
    setCreatingPostCategoryId(categoryId);
    setShowPostModal(true);
  };

  const handleRemovePostClick = (categoryId: any, categoryTitle: any) => {
    setDeletingPostCategoryId(categoryId);
    setDeletingPostCategoryTitle(categoryTitle);
    setShowDeleteModal(true);
  };

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Categories</h1>
          <div className="flex space-x-2">
            <AddNewButton
              onClick={() => setShowImportCategoriesModal(true)}
              light
            >
              Import <span className="ml-2">＋</span>
            </AddNewButton>
            <AddNewButton onClick={() => setShowCategoryModal(true)}>
              Add Category <span className="ml-2">＋</span>
            </AddNewButton>
          </div>
        </div>
      </Header>

      <Container dark>
        {isLoading ? (
          <ContainerLoader />
        ) : categories && categories?.length > 0 ? (
          <CategoryList
            categories={categories}
            subdomain={subdomain}
            addPostClick={handleAddPostClick}
            removePostClick={handleRemovePostClick}
          />
        ) : (
          <div className="text-center">
            <p className="my-4 text-2xl text-gray-600">
              No categories yet. Click &quot;Add Category&quot; to create one.
            </p>
          </div>
        )}
      </Container>
      <Modal showModal={showCategoryModal} setShowModal={setShowCategoryModal}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createCategory(subdomain);
          }}
          className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <div className="px-8">
            <h2 className="mb-6 text-2xl">Add a New Category</h2>
            <div className="flex-start flex flex-col items-center space-y-4">
              <input
                className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                name="title"
                required
                placeholder="Category Title"
                ref={categoryTitleRef}
                type="text"
                onBlur={generateSlug}
              />
              <input
                className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                name="slug"
                required
                placeholder="Category Slug"
                ref={categorySlugRef}
                type="text"
              />
            </div>
          </div>
          <div className="mt-10 flex w-full items-center justify-between">
            <button
              type="button"
              className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-600 transition-all duration-150 ease-in-out hover:text-black focus:outline-none focus:ring-0"
              onClick={() => {
                setShowCategoryModal(false);
              }}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={creatingCategory}
              className={`${
                creatingCategory
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "bg-white text-gray-600 hover:text-black"
              } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
            >
              {creatingCategory ? <LoadingDots /> : "CREATE CATEGORY"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        showModal={showImportCategoriesModal}
        setShowModal={setShowImportCategoriesModal}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            importCategories(subdomain);
          }}
          className="inline-block w-full max-w-xl overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <div className="px-8">
            <h2 className="mb-6 text-2xl">Import Categories</h2>
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
              <div className="mt-auto flex items-center justify-between">
                <label className="text-sm hover:cursor-pointer" htmlFor="check">
                  Generate Content for Categories
                </label>
                <input
                  className="ml-2 hover:cursor-pointer"
                  id="check"
                  name="check"
                  checked={showImportCategoriesPrompts}
                  onChange={() =>
                    setShowImportCategoriesPrompts(!showImportCategoriesPrompts)
                  }
                  type="checkbox"
                />
              </div>
              {showImportCategoriesPrompts && (
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
                    <option value="">
                      Prompt to Generate Category Content
                    </option>
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
                setShowCategoryModal(false);
              }}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={creatingCategory}
              className={`${
                creatingCategory
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "bg-white text-gray-600 hover:text-black"
              } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
            >
              {creatingCategory ? <LoadingDots /> : "CREATE CATEGORY"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal showModal={showPostModal} setShowModal={setShowPostModal}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createPost(subdomain, creatingPostCategoryId);
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
                setShowPostModal(false);
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
      <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await deleteCategory(deletingPostCategoryId);
          }}
          className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <h2 className=" mb-6 text-2xl">Delete Category</h2>
          <div className="mx-auto grid w-5/6 gap-y-4">
            <p className="mb-3 text-gray-600">
              Are you sure you want to delete your category:{" "}
              <b>{deletingPostCategoryTitle}</b>? This action is not reversible.
              Type in <span className="bg-slate-200 px-1">delete</span> to
              confirm.
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
    </Layout>
  );
}
