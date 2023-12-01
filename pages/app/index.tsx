import { useState, useEffect, useRef } from "react";
import Layout from "@/components/app/Layout";
import Modal from "@/components/Modal";
import LoadingDots from "@/components/app/loading-dots";
import { useSession } from "next-auth/react";
import { useDebounce } from "use-debounce";
import { HttpMethod } from "@/types";

import SiteCard from "@/components/app/SiteCard";
import AddNewButton from "@/components/app/AddNewButton";
import Header from "@/components/Layout/Header";
import Container from "@/components/Layout/Container";
import { useSites, useUser } from "@/lib/queries";
import ContainerLoader from "@/components/app/ContainerLoader";
import getSlug from "speakingurl";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import PricingTable from "@/components/app/PricingTable";
import Link from "next/link";

export default function AppIndex() {
  const [modal, setModal] = useState<{ isOpen: boolean; isWp: boolean }>({
    isOpen: false,
    isWp: false,
  });
  const [creatingSite, setCreatingSite] = useState<boolean>(false);
  const [subdomain, setSubdomain] = useState<string>("");
  const [debouncedSubdomain] = useDebounce(subdomain, 1500);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const siteNameRef = useRef<HTMLInputElement | null>(null);
  const siteSubdomainRef = useRef<HTMLInputElement | null>(null);
  const wpDomainRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const { data: session } = useSession();
  const sessionId = session?.user?.id;

  const { sites, isLoading, mutateSites } = useSites();
  const { user } = useUser();

  async function createWpSite() {
    setCreatingSite(true);

    try {
      const res = await fetch("/api/site", {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: sessionId,
          name: siteNameRef.current?.value,
          subdomain: siteNameRef.current?.value,
          customDomain: wpDomainRef.current?.value,
          isWordpress: true,
          wpConfig: {
            endpoint: `${wpDomainRef.current?.value}/wp-json`,
            username: usernameRef.current?.value,
            password: passwordRef.current?.value,
          },
        }),
      });

      const body = await res.json();
      if (res.ok) {
        toast.success("Successfully created a new site!");
        router.push(`/site/${body.subdomain}`);
      }
    } catch (err) {
      toast.error("Could not create a new site!");
      console.error(err);
    } finally {
      mutateSites();
      setCreatingSite(false);
    }
  }

  async function createSite() {
    setCreatingSite(true);

    try {
      const res = await fetch("/api/site", {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: sessionId,
          name: siteNameRef.current?.value,
          subdomain: siteSubdomainRef.current?.value,
        }),
      });

      const body = await res.json();
      if (res.ok) {
        toast.success("Successfully created a new site!");
        router.push(`/site/${body.subdomain}`);
      }
    } catch (err) {
      toast.error("Could not create a new site!");
      console.error(err);
    } finally {
      mutateSites();
      setCreatingSite(false);
    }
  }

  useEffect(() => {
    async function checkSubDomain() {
      if (debouncedSubdomain.length > 0) {
        const response = await fetch(
          `/api/domain/check?domain=${debouncedSubdomain}&subdomain=1`
        );
        const available = await response.json();
        if (available) {
          setError(null);
        } else {
          setError(
            `${debouncedSubdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}`
          );
        }
      }
    }
    checkSubDomain();
  }, [debouncedSubdomain]);

  const generateSlug = (e: any) => {
    const title = e.target.value;
    const slug = getSlug(title);

    if (siteSubdomainRef) {
      if (!siteSubdomainRef?.current) return;
      siteSubdomainRef.current.value = slug;
    }
  };

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Sites</h1>
          <div>
            <AddNewButton
              onClick={() => setModal({ isOpen: true, isWp: false })}
            >
              Add Site <span className="ml-2">＋</span>
            </AddNewButton>
            <AddNewButton
              className="ml-4"
              onClick={() => setModal({ isOpen: true, isWp: true })}
              light
            >
              Add Wordpress Site <span className="ml-2">＋</span>
            </AddNewButton>
          </div>
        </div>
      </Header>
      <Container dark>
        {isLoading ? (
          <ContainerLoader />
        ) : user && user.isSubscribed ? (
          <div className="grid gap-y-4">
            {sites && sites.length > 0 ? (
              sites.map((site) => <SiteCard site={site} key={site.id} />)
            ) : (
              <>
                <div className="text-center">
                  <p className="my-4 text-2xl text-gray-600">
                    No sites yet. Click &quot;Add Site&quot; to create one.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <PricingTable />
        )}
      </Container>

      <Modal showModal={modal.isOpen} setModal={setModal}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            modal.isWp ? createWpSite() : createSite();
          }}
          className="inline-block w-full max-w-xl overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          {modal.isWp ? (
            <>
              <h2 className="mb-6 text-2xl">Create a New Wordpress Site</h2>
              <div className="mx-auto grid w-5/6 gap-y-4">
                <div className="flex-start flex items-center rounded border border-gray-700">
                  <span className="pl-5 pr-1">📌</span>
                  <input
                    className="w-full rounded-none rounded-r-lg border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    name="name"
                    required
                    placeholder="Name"
                    ref={siteNameRef}
                    type="text"
                  />
                </div>
                <div className="flex-start flex items-center rounded border border-gray-700">
                  <span className="pl-5 pr-1">🪧</span>
                  <input
                    className="w-full rounded-none rounded-l-lg border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    name="wpDomain"
                    placeholder="domain.com (Without https://)"
                    ref={wpDomainRef}
                    type="text"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="mb-2 text-left">Authentication</h3>
                  <div className="flex-start mb-4 flex items-center rounded border border-gray-700">
                    <span className="pl-5 pr-1">🪧</span>
                    <input
                      className="w-full rounded-none rounded-l-lg border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                      name="username"
                      placeholder="Username"
                      ref={usernameRef}
                      type="text"
                    />
                  </div>
                  <div className="flex-start flex items-center rounded border border-gray-700">
                    <span className="pl-5 pr-1">🪧</span>
                    <input
                      className="w-full rounded-none rounded-l-lg border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                      name="password"
                      placeholder="Password"
                      ref={passwordRef}
                      type="text"
                    />
                  </div>
                  <p className="mt-2">
                    {"Can't find credentials? Check official documentation "}
                    <Link
                      className="underline"
                      target="_blank"
                      href="https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/#basic-authentication-with-application-passwords"
                    >
                      here
                    </Link>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-6 text-2xl">Create a New Site</h2>
              <div className="mx-auto grid w-5/6 gap-y-4">
                <div className="flex-start flex items-center rounded border border-gray-700">
                  <span className="pl-5 pr-1">📌</span>
                  <input
                    className="w-full rounded-none rounded-r-lg border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    name="name"
                    required
                    placeholder="Name"
                    ref={siteNameRef}
                    type="text"
                    onBlur={generateSlug}
                  />
                </div>
                <div className="flex-start flex items-center rounded border border-gray-700">
                  <span className="pl-5 pr-1">🪧</span>
                  <input
                    className="w-full rounded-none rounded-l-lg border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    name="subdomain"
                    onInput={() =>
                      setSubdomain(siteSubdomainRef.current!.value)
                    }
                    placeholder="Subdomain"
                    ref={siteSubdomainRef}
                    type="text"
                  />
                  <span className="flex h-full items-center rounded-r-lg border-l border-gray-600 bg-gray-100 px-5">
                    .{process.env.NEXT_PUBLIC_DOMAIN_URL}
                  </span>
                </div>
                {error && (
                  <p className="px-5 text-left text-red-500">
                    <b>{error}</b> is not available. Please choose another
                    subdomain.
                  </p>
                )}
              </div>
            </>
          )}
          <div className="mt-10 flex w-full items-center justify-between">
            <button
              type="button"
              className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-600 transition-all duration-150 ease-in-out hover:text-black focus:outline-none focus:ring-0"
              onClick={() => {
                setError(null);
                setModal({ ...modal, isOpen: false });
              }}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={creatingSite || error !== null}
              className={`${
                creatingSite || error
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "bg-white text-gray-600 hover:text-black"
              } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
            >
              {creatingSite ? <LoadingDots /> : "CREATE SITE"}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
