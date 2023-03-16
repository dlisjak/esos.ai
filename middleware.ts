import { NextRequest, NextResponse } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

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

const locales = ["en", "de", "nl"];

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  // @ts-ignore locales are readonly
  return matchLocale(languages, locales, "en");
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

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

  const pathnameIsMissingLocale = locales.every(
    (locale) => !path.startsWith(`/${locale}/`) && path !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(req);
    console.log(`/${locale}/${path}`);

    return NextResponse.redirect(new URL(`/${locale}/${path}`, req.url));
  }

  console.log(`/_sites/classic/${currentHost}${path}`);
  // rewrite everything else to `/_sites/[site] dynamic route
  return NextResponse.rewrite(
    new URL(`/_sites/classic/${currentHost}${path}`, req.url)
  );
}
