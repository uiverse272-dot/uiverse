"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useMemo } from "react";
import { localize, stripLang, type Lang } from "./config";
import type { Dict } from "./dict";

const I18n = createContext<{ lang: Lang; t: Dict } | null>(null);

/** Set once in the [lang] layout; only the active language's dictionary reaches the browser. */
export function LangProvider({ lang, t, children }: { lang: Lang; t: Dict; children: React.ReactNode }) {
  const value = useMemo(() => ({ lang, t }), [lang, t]);
  return <I18n value={value}>{children}</I18n>;
}

export function useI18n() {
  const ctx = useContext(I18n);
  if (!ctx) throw new Error("useI18n outside LangProvider");
  return ctx;
}

/** Every in-app navigation carries this type, so the page crossfade (the app layout) runs on
    navigations and not on the other transitions a page makes, such as saving. */
export const NAV = ["nav"];

/** next/link that keeps you in your language: href="/web" is /ar/web on an Arabic page. */
export function Link({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const { lang } = useI18n();
  const to = typeof href === "string" ? localize(lang, href) : { ...href, pathname: href.pathname && localize(lang, href.pathname) };
  return <NextLink href={to} transitionTypes={NAV} {...props} />;
}

/**
 * The path without its locale. English URLs are unprefixed but routed as /en/…, so the raw
 * usePathname() can read "/en/web" on the server and "/web" in the browser; stripping both
 * makes them agree and keeps hydration stable.
 */
export const useLocalPath = () => stripLang(usePathname());

/** useRouter whose push / replace / prefetch take unprefixed paths and stay in the language. */
export function useLocalRouter() {
  const router = useRouter();
  const { lang } = useI18n();
  return useMemo(
    () => ({
      ...router,
      push: (href: string, o?: Parameters<typeof router.push>[1]) => router.push(localize(lang, href), { transitionTypes: NAV, ...o }),
      replace: (href: string, o?: Parameters<typeof router.replace>[1]) => router.replace(localize(lang, href), { transitionTypes: NAV, ...o }),
      prefetch: (href: string) => router.prefetch(localize(lang, href)),
    }),
    [router, lang],
  );
}
