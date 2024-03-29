import { signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoadingDots from "@/components/app/loading-dots";
import toast, { Toaster } from "react-hot-toast";

const pageTitle = "Login";
const logo = "/logo_icon.svg";

import "../../styles/home.css";

export default function Login() {
  const [loading, setLoading] = useState(false);

  // Get error message added by next/auth in URL.
  const { query } = useRouter();
  const { error } = query;

  useEffect(() => {
    const errorMessage = Array.isArray(error) ? error.pop() : error;
    errorMessage && toast.error(errorMessage);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-black py-12 sm:px-6 lg:px-8">
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" href={logo} />
        <link rel="shortcut icon" type="image/x-icon" href={logo} />
        <link rel="apple-touch-icon" sizes="180x180" href={logo} />
        <meta name="theme-color" content="#7b46f6" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta itemProp="name" content={pageTitle} />
        <meta itemProp="image" content={logo} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:image" content={logo} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Elegance" />
        <meta name="twitter:creator" content="@StevenTey" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:image" content={logo} />
      </Head>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          alt="Platforms Starter Kit"
          width={100}
          height={100}
          className="relative mx-auto h-20 w-auto p-2"
          src="/logo_icon.svg"
        />
        <h1 className="mt-6 text-center text-3xl font-semibold text-white">
          AI Auto Blogs
        </h1>
      </div>

      <div className="mx-auto mt-8 w-11/12 sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded sm:px-10">
          <h2 className="mb-6 text-center text-2xl">Login/Signup</h2>
          <button
            disabled={loading}
            onClick={() => {
              setLoading(true);
              signIn("google");
            }}
            className={`${
              loading ? "cursor-not-allowed bg-gray-600" : "bg-[#4285f4]"
            } group my-2 flex h-16 w-full items-center justify-center space-x-5 rounded text-white focus:outline-none sm:px-4`}
          >
            {loading ? (
              <LoadingDots color="#fff" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 group-hover:animate-wiggle"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
            )}
          </button>
          <button
            disabled={loading}
            onClick={() => {
              setLoading(true);
              signIn("github");
            }}
            className={`${
              loading ? "cursor-not-allowed bg-gray-600" : "bg-black"
            } group my-2 flex h-16 w-full items-center justify-center space-x-5 rounded focus:outline-none sm:px-4`}
          >
            {loading ? (
              <LoadingDots color="#fff" />
            ) : (
              <svg
                className="h-8 w-8 group-hover:animate-wiggle"
                aria-hidden="true"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
