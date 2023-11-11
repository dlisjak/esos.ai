import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

import type { Meta, WithChildren } from "@/types";

interface LayoutProps extends WithChildren {
  meta?: Meta;
  siteId?: string;
  subdomain?: string;
}

export default function Layout({ meta, children, subdomain }: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.pageYOffset > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const [closeModal, setCloseModal] = useState<boolean>(
    !!Cookies.get("closeModal")
  );

  useEffect(() => {
    if (closeModal) {
      Cookies.set("closeModal", "true");
    } else {
      Cookies.remove("closeModal");
    }
  }, [closeModal]);

  return (
    <div>
      <Head>
        <title>{meta?.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href={meta?.logo} />
        <link rel="apple-touch-icon" sizes="180x180" href={meta?.logo} />
        <meta name="theme-color" content="#7b46f6" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta itemProp="name" content={meta?.title} />
        <meta itemProp="description" content={meta?.description} />
        <meta itemProp="image" content={meta?.ogImage} />
        <meta name="description" content={meta?.description} />
        <meta property="og:title" content={meta?.title} />
        <meta property="og:description" content={meta?.description} />
        <meta property="og:url" content={meta?.ogUrl} />
        <meta property="og:image" content={meta?.ogImage} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@aiautoblogs" />
        <meta name="twitter:creator" content="@dlisjak" />
        <meta name="twitter:title" content={meta?.title} />
        <meta name="twitter:description" content={meta?.description} />
        <meta name="twitter:image" content={meta?.ogImage} />
        {subdomain != "demo" && <meta name="robots" content="noindex" />}
      </Head>
      <div
        className={`fixed w-full ${
          scrolled ? "drop-shadow-md" : ""
        }  ease top-0 left-0 right-0 z-30 flex h-16 bg-white transition-all duration-150`}
      >
        <div className="mx-auto flex h-full max-w-screen-lg items-center justify-center space-x-5">
          <Link href="/" className="flex items-center justify-center">
            {meta?.logo && (
              <div className="inline-block h-8 w-8 overflow-hidden rounded-full align-middle">
                <Image
                  alt={meta?.title ?? "Logo"}
                  height={40}
                  src={meta?.logo}
                  width={40}
                />
              </div>
            )}
            <span className="ml-3 inline-block truncate font-medium">
              {meta?.title}
            </span>
          </Link>
        </div>
      </div>

      <div className="pt-4">{children}</div>

      {subdomain == "demo" && (
        <div
          className={`${
            closeModal ? "h-14 lg:h-auto" : "h-60 sm:h-40 lg:h-auto"
          } sticky bottom-5 mx-5 flex max-w-screen-lg flex-col items-center justify-between space-y-3 rounded border-t-4 border-black bg-white px-5 pt-0 pb-3 drop-shadow-lg transition-all duration-150 ease-in-out
          lg:flex-row lg:space-y-0 lg:pt-3 xl:mx-auto`}
        >
          <button
            onClick={() => setCloseModal(!closeModal)}
            className={`${
              closeModal ? "rotate-180" : "rotate-0"
            } absolute top-2 right-3 text-black transition-all duration-150 ease-in-out lg:hidden`}
          >
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              shapeRendering="geometricPrecision"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div
            className={`${
              closeModal ? "hidden lg:flex" : ""
            } flex w-full flex-col space-y-3 text-center sm:flex-row sm:space-y-0 sm:space-x-3 lg:w-auto`}
          >
            <Link
              className="whitespace-no-wrap flex-auto rounded border border-gray-200 py-1 px-5 text-lg text-black transition-all duration-150 ease-in-out hover:border-black sm:py-3"
              href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://app.${process.env.NEXT_PUBLIC_DOMAIN_URL}`}
              rel="noreferrer"
              target="_blank"
            >
              Create your publication
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
