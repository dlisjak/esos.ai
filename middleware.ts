import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";

// import rewrites from "./public/rewrites/index.json";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /examples (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

const locales = ["en", "de", "nl"];

function getLocale(req: NextRequest) {
  const language = new Negotiator(req).language(locales);

  const defaultLocale = "en";

  return language || defaultLocale;
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.${process.env.NEXT_PUBLIC_DOMAIN_URL}, demo.localhost:3000)
  const hostname = req.headers.get("host") || `demo.esos-digital.vercel.app`;

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = url.pathname;

  console.log("path", path);

  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(".esos-digital.vercel.app", "")
      : hostname.replace(`.localhost:3000`, "");

  console.log("currentHost", currentHost);

  // rewrites for app pages
  if (currentHost == "app") {
    if (
      url.pathname === "/login" &&
      (req.cookies.get("next-auth.session-token") ||
        req.cookies.get("__Secure-next-auth.session-token"))
    ) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (url.pathname === "/prompts") {
      url.pathname = "/app/prompts";
      return NextResponse.rewrite(url);
    }

    if (url.pathname === "/account") {
      url.pathname = "/app/account";
      return NextResponse.rewrite(url);
    }

    url.pathname = `/app${url.pathname}`;

    return NextResponse.rewrite(url);
  }

  // rewrite root application to `/home` folder
  if (hostname == "localhost:3000" || hostname == "esos-digital.vercel.app") {
    console.log("home", path);
    return NextResponse.rewrite(new URL(`/home${path}`, req.url));
  }

  // console.log("hostname 2", hostname);

  // if (hostname) {
  // }

  // const locale = getLocale(req);
  // const pathname = req.nextUrl.pathname;
  // const pathnameIsMissingLocale = locales.every(
  //   (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  // );

  // // Redirect if there is no locale
  // if (pathnameIsMissingLocale) {
  //   // e.g. incoming request is /products
  //   // The new URL is now /en-US/products
  //   return NextResponse.redirect(new URL(`/${locale}${path}`, req.url));
  // }

  // if (rewrites.length) {
  //   const siteObject = rewrites.find(
  //     (rewrite: {
  //       customDomain: string | null;
  //       subdomain: string;
  //       theme: string;
  //     }) =>
  //       rewrite?.customDomain === currentHost ||
  //       rewrite?.subdomain === currentHost
  //   ) || { customDomain: null, theme: "classic" };

  //   if (siteObject) {
  //     const theme = siteObject?.theme || "classic";

  //     return NextResponse.rewrite(
  //       new URL(`/_sites/${theme}/${currentHost}${path}`, req.url)
  //     );
  //   }
  // }

  // rewrite everything else to `/_sites/[site] dynamic route
  return NextResponse.rewrite(
    new URL(`/_sites/classic/${currentHost}${path}`, req.url)
  );
}
