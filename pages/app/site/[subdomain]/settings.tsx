import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import { useS3Upload } from "next-s3-upload";

import DomainCard from "@/components/app/DomainCard";
import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import Modal from "@/components/Modal";
import Header from "@/components/Layout/Header";
import Container from "@/components/Layout/Container";

import type { Site } from "@prisma/client";
import { HttpMethod } from "@/types";
import { fetcher } from "@/lib/fetcher";
import { Theme } from "@prisma/client";
import { useSite } from "@/lib/queries";
import ContainerLoader from "@/components/app/ContainerLoader";

interface SettingsData
  extends Pick<
    Site,
    "id" | "name" | "font" | "subdomain" | "customDomain" | "image" | "themeId"
  > {}

export default function SiteSettings() {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSite, setDeletingSite] = useState(false);
  const [imagePreview, setImagePreview] = useState<any>();
  const [imageData, setImageData] = useState<any>();
  const { FileInput, uploadToS3 } = useS3Upload();

  const { subdomain } = router.query;
  const sessionUser = session?.user?.name;

  const { site, isLoading, isError, mutateSite } = useSite(subdomain);

  const { data: themes } = useSWR<Theme[] | null>(
    subdomain && `/api/theme`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const [data, setData] = useState<SettingsData>({
    id: "",
    name: null,
    font: "",
    subdomain: null,
    customDomain: null,
    image: null,
    themeId: "",
  });

  useEffect(() => {
    if (site) setData(site);
  }, [site]);

  async function saveSiteSettings(data: SettingsData) {
    setSaving(true);

    let imageUrl;

    if (imageData) {
      imageUrl = await uploadImage(imageData);
    }

    try {
      const res = await fetch("/api/site", {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentSubdomain: site?.subdomain ?? undefined,
          ...data,
          id: data.id,
          image: imageUrl,
        }),
      });

      if (res.ok) {
        mutateSite();
        toast.success(`Changes Saved`);
      }
    } catch (error) {
      toast.error("Failed to save site");
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSite(subdomain: string) {
    setDeletingSite(true);

    try {
      const response = await fetch(`/api/site?subdomain=${subdomain}`, {
        method: HttpMethod.DELETE,
      });

      if (response.ok) {
        router.push("/");
      } else {
        toast.error(
          "Deleting unsuccessful. Please remove all categories and try again."
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingSite(false);
    }
  }

  const [debouncedSubdomain] = useDebounce(data?.subdomain, 1500);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSubdomain() {
      try {
        const response = await fetch(
          `/api/domain/check?domain=${debouncedSubdomain}&subdomain=1`
        );

        const available = await response.json();

        setSubdomainError(
          available
            ? null
            : `${debouncedSubdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`
        );
      } catch (error) {
        console.error(error);
      }
    }

    if (
      debouncedSubdomain !== site?.subdomain &&
      debouncedSubdomain &&
      debouncedSubdomain?.length > 0
    )
      checkSubdomain();
  }, [debouncedSubdomain, site?.subdomain]);

  async function handleCustomDomain() {
    const customDomain = data.customDomain;

    setAdding(true);

    try {
      const response = await fetch(
        `/api/domain?domain=${customDomain}&subdomain=${subdomain}`,
        {
          method: HttpMethod.POST,
        }
      );

      if (!response.ok)
        throw {
          code: response.status,
          domain: customDomain,
        };
      setError(null);
      mutateSite();
    } catch (error) {
      setError(error);
    } finally {
      setAdding(false);
    }
  }

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

  const handleImageSelect = async (file) => {
    const imagePreviewSrc = URL.createObjectURL(file);

    setImagePreview(imagePreviewSrc);
    return setImageData(file);
  };

  return (
    <Layout>
      <Header>
        <h1 className="text-4xl">Site Settings</h1>
      </Header>
      {isLoading ? (
        <ContainerLoader />
      ) : (
        <>
          <Container className="pb-24">
            <div className="my-4 flex flex-col space-y-4">
              <div className="flex w-full  space-x-8">
                <div className="flex w-full flex-col space-y-2">
                  <h2 className="text-xl">Name</h2>
                  <div className="flex max-w-lg items-center overflow-hidden rounded border border-gray-700">
                    <input
                      className="w-full rounded-none border-none  bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                      name="name"
                      onInput={(e) =>
                        setData((data) => ({
                          ...data,
                          name: (e.target as HTMLTextAreaElement).value,
                        }))
                      }
                      placeholder="Untitled Site"
                      type="text"
                      value={data.name || ""}
                    />
                  </div>
                </div>
                <div className="flex w-full flex-col space-y-2">
                  <h2 className="text-xl">Font</h2>
                  <div className="flex w-full max-w-lg items-center overflow-hidden rounded border border-gray-700">
                    <select
                      onChange={(e) =>
                        setData((data) => ({
                          ...data,
                          font: (e.target as HTMLSelectElement).value,
                        }))
                      }
                      value={data?.font || ""}
                      className="w-full rounded-none border-none  bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    >
                      <option value="">Cal Sans</option>
                      <option value="font-lora">Lora</option>
                      <option value="font-work">Work Sans</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex w-full  space-x-8">
                <div className="flex w-full flex-col space-y-2">
                  <h2 className="text-xl">Subdomain</h2>
                  <div className="flex max-w-lg items-center rounded border border-gray-700">
                    <input
                      className="w-1/2 rounded-none rounded-l-lg  border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                      name="subdomain"
                      onInput={(e) =>
                        setData((data) => ({
                          ...data,
                          subdomain: (e.target as HTMLTextAreaElement).value,
                        }))
                      }
                      placeholder="subdomain"
                      type="text"
                      value={data.subdomain || ""}
                    />
                    <div className="flex h-12 w-1/2 items-center justify-center  rounded-r-lg border-l border-gray-600 bg-gray-100">
                      {process.env.NEXT_PUBLIC_DOMAIN_URL}
                    </div>
                  </div>
                  {data.subdomain !== subdomain && subdomainError && (
                    <p className="px-5 text-left text-red-500">
                      <b>{subdomainError}</b> is not available. Please choose
                      another subdomain.
                    </p>
                  )}
                </div>
                <div className="flex w-full flex-col space-y-2">
                  <h2 className="text-xl">Custom Domain</h2>
                  {site?.customDomain ? (
                    <DomainCard data={data} />
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await handleCustomDomain();
                      }}
                      className="flex max-w-lg items-center justify-start space-x-3"
                    >
                      <div className="flex-auto overflow-hidden rounded border border-gray-700">
                        <input
                          autoComplete="off"
                          className="w-full rounded-none border-none  bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                          name="customDomain"
                          onInput={(e) => {
                            setData((data) => ({
                              ...data,
                              customDomain: (e.target as HTMLTextAreaElement)
                                .value,
                            }));
                          }}
                          pattern="^(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$"
                          placeholder="mydomain.com"
                          value={data.customDomain || ""}
                          type="text"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-28 rounded border border-solid border-black bg-black px-5 py-3  text-white transition-all duration-150 ease-in-out hover:bg-white hover:text-black focus:outline-none"
                      >
                        {adding ? <LoadingDots /> : "Add"}
                      </button>
                    </form>
                  )}
                  {error && (
                    <div className="mt-5 flex w-full max-w-2xl items-center space-x-2 text-left text-sm text-red-500">
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        shapeRendering="geometricPrecision"
                        style={{ color: "#f44336" }}
                      >
                        <circle cx="12" cy="12" r="10" fill="white" />
                        <path d="M12 8v4" stroke="#f44336" />
                        <path d="M12 16h.01" stroke="#f44336" />
                      </svg>
                      {error.code == 403 ? (
                        <p>
                          <b>{error.domain}</b> is already owned by another
                          team.
                          <button
                            className="ml-1"
                            onClick={async (e) => {
                              e.preventDefault();
                              await fetch(
                                `/api/request-delegation?domain=${error.domain}`
                              ).then((res) => {
                                if (res.ok) {
                                  toast.success(
                                    `Requested delegation for ${error.domain}. Try adding the domain again in a few minutes.`
                                  );
                                } else {
                                  alert(
                                    "There was an error requesting delegation. Please try again later."
                                  );
                                }
                              });
                            }}
                          >
                            <u>Click here to request access.</u>
                          </button>
                        </p>
                      ) : (
                        <p>
                          Cannot add <b>{error.domain}</b> since it&apos;s
                          already assigned to another project.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex w-full space-x-8">
                <div className="w-full">
                  <div className="relative flex w-full max-w-lg flex-col space-y-2">
                    <h2 className="text-xl">Logo Image</h2>
                    <div className="w-full max-w-lg">
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
                </div>
                <div className="flex w-full flex-col justify-between">
                  <div className="mb-auto flex w-full flex-col">
                    <h2 className="text-xl">Theme</h2>
                    <div className="flex w-full max-w-lg items-center overflow-hidden rounded border border-gray-700">
                      <select
                        onChange={(e) =>
                          setData((data) => ({
                            ...data,
                            themeId: (e.target as HTMLSelectElement).value,
                          }))
                        }
                        value={data?.themeId || ""}
                        className="w-full rounded-none border-none  bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                      >
                        <option value="" disabled>
                          Select a Theme
                        </option>
                        {themes?.map((theme) => (
                          <option value={theme.id} key={theme.id}>
                            {theme.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex w-full flex-col space-y-2">
                    <h2 className="text-xl">Delete Site</h2>
                    <p>
                      Permanently delete your site and all of its contents from
                      our platform. This action is not reversible – please
                      continue with caution.
                    </p>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                      }}
                      className="max-w-max rounded border border-solid border-red-500 bg-red-500 px-5 py-3  text-white transition-all duration-150 ease-in-out hover:bg-white hover:text-red-500 focus:outline-none"
                    >
                      Delete Site
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Container>
          <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await deleteSite(subdomain as string);
              }}
              className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
            >
              <h2 className="mb-6 text-xl">Delete Site</h2>
              <div className="mx-auto grid w-5/6 gap-y-4">
                <p className="mb-3 text-gray-600">
                  Are you sure you want to delete your site: <b>{data.name}</b>?
                  This action is not reversible. Type in{" "}
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
                  disabled={deletingSite}
                  className={`${
                    deletingSite
                      ? "cursor-not-allowed bg-gray-50 text-gray-400"
                      : "bg-white text-gray-600 hover:text-black"
                  } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
                >
                  {deletingSite ? <LoadingDots /> : "DELETE SITE"}
                </button>
              </div>
            </form>
          </Modal>

          <footer className="fixed inset-x-0 bottom-0 z-20 h-20 border-t border-solid border-gray-500 bg-white">
            <div className="mx-auto flex h-full max-w-screen-lg items-center justify-end">
              <button
                onClick={() => {
                  saveSiteSettings(data);
                }}
                disabled={saving || subdomainError !== null}
                className={`${
                  saving || subdomainError
                    ? "cursor-not-allowed border-gray-300 bg-gray-300"
                    : "border-black bg-black hover:bg-white hover:text-black"
                } mx-2 h-12 w-36 rounded border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
              >
                {saving ? <LoadingDots /> : "Save Changes"}
              </button>
            </div>
          </footer>
        </>
      )}
    </Layout>
  );
}
