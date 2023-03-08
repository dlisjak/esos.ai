import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /examples (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|examples/|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  console.log(url);

  // Get hostname of request (e.g. demo.${process.env.NEXT_PUBLIC_DOMAIN_URL}, demo.localhost:3000)
  const hostname =
    req.headers.get("host") || `demo.${process.env.NEXT_PUBLIC_DOMAIN_URL}`;

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = url.pathname;

  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.${process.env.NEXT_PUBLIC_DOMAIN_URL}`, "")
      : hostname.replace(`.localhost:3000`, "");

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
  if (
    hostname === "localhost:3000" ||
    hostname === `${process.env.NEXT_PUBLIC_DOMAIN_URL}`
  ) {
    return NextResponse.rewrite(new URL(`/home${path}`, req.url));
  }

  console.log(currentHost);
  console.log(path);
  // rewrite everything else to `/_sites/[site] dynamic route
  return NextResponse.rewrite(
    new URL(`/_sites/${currentHost}${path}`, req.url)
  );
}
