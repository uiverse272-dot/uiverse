/**
 * Locales and URL rules, shared by the proxy, the server and the client.
 *
 * English keeps the unprefixed URLs it always had (/web/fintech); Arabic lives under /ar
 * (/ar/web/fintech). Internally every route sits under app/[lang], and the proxy rewrites an
 * unprefixed URL to /en/… so the router sees one shape.
 */
export const LOCALES = ["en", "ar"] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "uiv.lang";

export const isLang = (s: unknown): s is Lang => typeof s === "string" && (LOCALES as readonly string[]).includes(s);
export const dirOf = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

/** "/web" → "/ar/web" in Arabic; unchanged in English, for external URLs, and if already prefixed. */
export function localize(lang: Lang, href: string): string {
  if (lang === DEFAULT_LANG || !href.startsWith("/") || href.startsWith("//")) return href;
  if (/^\/ar(?=[/?#]|$)/.test(href)) return href;
  return href === "/" ? "/ar" : `/ar${href}`;
}

/** The path without its locale: "/ar/web" and "/en/web" are both "/web". */
export const stripLang = (path: string) => path.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
