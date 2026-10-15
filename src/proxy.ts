import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE } from "@/i18n/config";

/**
 * English URLs stay unprefixed (/web) and Arabic ones carry /ar (/ar/web), but every route lives
 * under app/[lang] — so an unprefixed path is rewritten to /en/… here, invisibly.
 *
 * Someone who switched to Arabic (the cookie the language switch sets) and comes back to the
 * home page is sent to /ar. Only the home page: a link to anything else was chosen — often
 * shared by someone else — so it opens in the language it's in. Crawlers carry no cookie.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (/^\/(en|ar)(\/|$)/.test(pathname)) return NextResponse.next();

  const navigation = request.method === "GET" && !request.headers.has("rsc");
  if (navigation && pathname === "/" && request.cookies.get(LANG_COOKIE)?.value === "ar") {
    return NextResponse.redirect(new URL(`/ar${search}`, request.url));
  }
  return NextResponse.rewrite(new URL(`/en${pathname}${search}`, request.url));
}

export const config = {
  /* not the API, Next's own files, public assets or root metadata files (anything with a dot) */
  matcher: ["/((?!api/|_next/|captures/|opengraph-image|.*\\..*).*)"],
};
