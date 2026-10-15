import type { Lang } from "./config";

/**
 * Number, plural and template helpers. Hand-written rather than Intl so the server and the
 * browser can't disagree — the same reason the feed hashes instead of calling Math.sin.
 * Arabic keeps Latin digits, as most Gulf product interfaces do.
 */

/** A message that varies with a count. Arabic uses all six forms; English only one and other. */
export type Plural = { other: string; zero?: string; one?: string; two?: string; few?: string; many?: string };

/** "Saved {n} items" + { n: 3 } */
export const fill = (s: string, vars: Record<string, string | number> = {}) =>
  s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/* CLDR plural rules, integers only */
function form(n: number, lang: Lang): keyof Plural {
  if (lang === "en") return n === 1 ? "one" : "other";
  const m = n % 100;
  if (n === 0) return "zero";
  if (n === 1) return "one";
  if (n === 2) return "two";
  if (m >= 3 && m <= 10) return "few";
  if (m >= 11 && m <= 99) return "many";
  return "other";
}

export const plural = (p: Plural, n: number, lang: Lang, vars: Record<string, string | number> = {}) =>
  fill(p[form(n, lang)] ?? p.other, { n: num(n), ...vars });

export const num = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** 2140 → "2.1k" / "2.1 ألف" — the English form is the one lib/data's compact() always produced */
export function compactNum(n: number, lang: Lang) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}${lang === "ar" ? " مليون" : "M"}`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}${lang === "ar" ? " ألف" : "k"}`;
  return String(n);
}

/**
 * A count shown compacted. Past a thousand the noun follows «ألف», so it takes the general form
 * («1.3 ألف مرة», never «مرات») whatever the raw number's own plural would be.
 */
export const pluralCount = (p: Plural, n: number, lang: Lang) =>
  n >= 1000 ? fill(p.other, { n: compactNum(n, lang) }) : plural(p, n, lang);

const AGO: Record<"d" | "w" | "mo" | "y", Plural> = {
  d: { one: "منذ يوم", two: "منذ يومين", few: "منذ {n} أيام", other: "منذ {n} يومًا" },
  w: { one: "منذ أسبوع", two: "منذ أسبوعين", few: "منذ {n} أسابيع", other: "منذ {n} أسبوعًا" },
  mo: { one: "منذ شهر", two: "منذ شهرين", few: "منذ {n} أشهر", other: "منذ {n} شهرًا" },
  y: { one: "منذ سنة", two: "منذ سنتين", few: "منذ {n} سنوات", other: "منذ {n} سنة" },
};

/** 3 → "3d ago" / "منذ 3 أيام" */
export function timeAgo(days: number, lang: Lang) {
  const [n, unit] =
    days < 7 ? [days, "d"] : days < 30 ? [Math.floor(days / 7), "w"] : days < 365 ? [Math.floor(days / 30), "mo"] : [Math.floor(days / 365), "y"];
  if (days < 1) return lang === "ar" ? "اليوم" : "today";
  return lang === "ar" ? plural(AGO[unit as keyof typeof AGO], n, lang) : `${n}${unit} ago`;
}
