import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { signOut } from "next-auth/react";
import Loader from "./Loader";
import useRequireAuth from "../../lib/useRequireAuth";

import TopNavLink from "./NavLink/TopNavLink";

export default function Layout({ children }: any) {
  const router = useRouter();
  const { subdomain, categoryId } = router.query;

  const logo = "/favicon.ico";

  const sitePage = router.pathname.startsWith("/app/site/[subdomain]");
  const postPage = router.pathname.startsWith("/app/site/[subdomain]/posts");
  const categoriesPage = router.pathname.startsWith(
    "/app/site/[subdomain]/categories"
  );
  const themePage = router.pathname.startsWith("/app/site/[subdomain]/themes");
  const draftsPage = router.pathname.startsWith(
    "/app/site/[subdomain]/posts/drafts"
  );
  const featuredPostsPage = router.pathname.startsWith(
    "/app/site/[subdomain]/posts/featured"
  );
  const categoryPage = router.pathname.startsWith(
    "/app/site/[subdomain]/categories/[categoryId]"
  );
  const categoryPostsPage = router.pathname.startsWith(
    "/app/site/[subdomain]/categories/[categoryId]/posts"
  );
  const categoryDraftsPage = router.pathname.startsWith(
    "/app/site/[subdomain]/categories/[categoryId]/drafts"
  );
  const postEditPage = router.pathname.startsWith(
    "/app/site/[subdomain]/posts/[postId]"
  );
  const categoryPostsEditPage = router.pathname.startsWith(
    "/app/site/[subdomain]/categories/[categoryId]/posts/[postId]"
  );
  const rootPage = !sitePage && !postPage && !categoryPage;
  const tab = rootPage
    ? router.asPath.split("/")[1]
    : router.asPath.split("/")[3];

  const title = `${subdomain || "Dashboard"} | ESOS AI`;
  const description =
    "Create a fullstack application with multi-tenancy and custom domains support using Next.js, Prisma, and PostgreSQL";

  const session = useRequireAuth();
  if (!session) return <Loader />;

  return (
    <>
      <div>
        <Head>
          <title>{title}</title>
          <link rel="icon" href={logo} />
          <link rel="shortcut icon" type="image/x-icon" href={logo} />
          <link rel="apple-touch-icon" sizes="180x180" href={logo} />
          <meta name="theme-color" content="#7b46f6" />

          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <meta itemProp="name" content={title} />
          <meta itemProp="description" content={description} />
          <meta itemProp="image" content={logo} />
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={logo} />
          <meta property="og:type" content="website" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@Vercel" />
          <meta name="twitter:creator" content="@StevenTey" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={logo} />
        </Head>
        <div className="relative z-40 h-16 border-b border-gray-200 bg-white px-4">
          <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between">
            <div className="flex items-center">
              {session.user && session.user.image && (
                <div className="inline-block h-8 w-8 overflow-hidden rounded-full align-middle">
                  <Image
                    src={session.user.image}
                    width={40}
                    height={40}
                    alt={session.user.name ?? "User avatar"}
                  />
                </div>
              )}
              <span className="ml-3 inline-block truncate font-medium sm:block">
                {session.user?.name}
              </span>
              <div className="ml-6 mr-2 h-8 border border-gray-300" />
              <TopNavLink href="/">Sites</TopNavLink>
              <TopNavLink href="/prompts">Prompts</TopNavLink>
              <TopNavLink href="/account">Account</TopNavLink>
            </div>
            <div className="flex items-center">
              <button
                className="text-gray-500 transition-all duration-150 ease-in-out hover:text-gray-700"
                onClick={() => signOut()}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        {sitePage && (
          <div className="relative z-40 border-b border-gray-200 bg-white px-4">
            <div className="mx-auto flex max-w-screen-xl items-center justify-between">
              <button className="ml-3 block" onClick={() => router.back()}>
                ← Back
              </button>
              <div className="flex items-center justify-between space-x-8">
                <Link
                  href={`/site/${subdomain}`}
                  className={`border-b-2 ${
                    !tab ? "border-black" : "border-transparent"
                  } py-3`}
                >
                  Dashboard
                </Link>
                <Link
                  href={`/site/${subdomain}/posts`}
                  className={`border-b-2 ${
                    postPage ? "border-black" : "border-transparent"
                  } py-3`}
                >
                  Posts
                </Link>
                <Link
                  href={`/site/${subdomain}/categories`}
                  className={`border-b-2 ${
                    categoriesPage ? "border-black" : "border-transparent"
                  } py-3`}
                >
                  Categories
                </Link>
                {/* <Link
                  href={`/site/${subdomain}/themes`}
                  className={`border-b-2 ${
                    themePage ? "border-black" : "border-transparent"
                  } py-3`}
                >
                  Themes
                </Link> */}
                <Link
                  href={`/site/${subdomain}/settings`}
                  className={`border-b-2 ${
                    tab == "settings" ? "border-black" : "border-transparent"
                  } py-3`}
                >
                  Settings
                </Link>
              </div>
              <div>{subdomain}</div>
            </div>
          </div>
        )}
        {postPage && (
          <div className="relative z-40 border-b border-gray-200 bg-white px-4">
            <div className="mx-auto flex max-w-screen-xl items-center justify-center space-x-16">
              <Link
                href={`/site/${subdomain}/posts`}
                className={`border-b-2 ${
                  postPage && !featuredPostsPage && !draftsPage
                    ? "border-black"
                    : "border-transparent"
                } py-3`}
              >
                Published
              </Link>
              <Link
                href={`/site/${subdomain}/posts/featured`}
                className={`border-b-2 ${
                  featuredPostsPage ? "border-black" : "border-transparent"
                } py-3`}
              >
                Featured
              </Link>
              <Link
                href={`/site/${subdomain}/posts/drafts`}
                className={`border-b-2 ${
                  draftsPage ? "border-black" : "border-transparent"
                } py-3`}
              >
                Drafts
              </Link>
            </div>
          </div>
        )}
        {categoryPage && (
          <div className="relative z-40 border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-screen-xl items-center justify-center space-x-16">
              <Link
                href={`/site/${subdomain}/categories/${categoryId}/posts`}
                className={`border-b-2 ${
                  categoryPostsPage ? "border-black" : "border-transparent"
                } py-3`}
              >
                Posts
              </Link>
              <Link
                href={`/site/${subdomain}/categories/${categoryId}`}
                className={`border-b-2 ${
                  categoryPage && !categoryPostsPage && !categoryDraftsPage
                    ? "border-black"
                    : "border-transparent"
                } py-3`}
              >
                Edit Category
              </Link>
            </div>
          </div>
        )}
        <div className="">{children}</div>
      </div>
    </>
  );
}
