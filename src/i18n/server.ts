import { lang as rootLang } from "next/root-params";
import { DEFAULT_LANG, isLang, localize, type Lang } from "./config";
import { DICTS, type Dict } from "./dict";

/** The page's language, from the [lang] root segment — readable in any Server Component. */
export async function getLang(): Promise<Lang> {
  const l = await rootLang();
  return isLang(l) ? l : DEFAULT_LANG;
}

export async function getI18n(): Promise<{ lang: Lang; t: Dict; href: (path: string) => string }> {
  const lang = await getLang();
  return { lang, t: DICTS[lang], href: (path) => localize(lang, path) };
}

/** canonical + hreflang for a path given without its locale ("/web/fintech") */
export function alternates(lang: Lang, path: string) {
  return {
    canonical: localize(lang, path),
    languages: { en: path, ar: localize("ar", path), "x-default": path },
  };
}
