import type { Lang } from "@/i18n/config";
import { CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES, COMPONENT_TYPES, PLATFORMS, name, type Term } from "./taxonomy";

/* The search box's parser. Runs in the browser (the ⌘K preview), so it reads only the taxonomy. */

/** `word` is what the user typed — a synonym like "banking", or a phrase like "real estate" — so removing the chip can remove it. */
/**
 * `param` doubles as the dimension: the caller labels it from its own dictionary
 * (t.search.dimensions[param]) — the parser runs in the browser and mustn't pull in every language.
 */
export type Dimension = "category" | "component" | "industry" | "style" | "tech" | "platform";
export type ParsedTerm = { label: string; param: Dimension; value: string; word: string };

const SYNONYMS: Record<string, string> = {
  landing: "landing-page", homepage: "landing-page", marketing: "landing-page",
  admin: "dashboard", analytics: "dashboard", console: "dashboard",
  shop: "ecommerce", store: "ecommerce", commerce: "ecommerce",
  signin: "auth", login: "auth", "log-in": "auth", "sign-in": "auth", signup: "auth", "sign-up": "auth",
  bank: "fintech", banking: "fintech", finance: "fintech", payments: "fintech",
  ml: "ai", "machine-learning": "ai", llm: "ai",
  medical: "healthcare", health: "healthcare", clinic: "healthcare",
  web3: "crypto", blockchain: "crypto", defi: "crypto",
  clean: "minimal", simple: "minimal", spare: "minimal",
  moody: "dark", night: "dark",
  premium: "luxury", elegant: "luxury", refined: "luxury",
  bold: "brutalist", raw: "brutalist",
  futurist: "futuristic", sci: "futuristic", neon: "futuristic",
  glass: "glassmorphism", frosted: "glassmorphism",
  fun: "playful", bright: "playful",
  next: "nextjs", "next.js": "nextjs", tailwindcss: "tailwind",
  iphone: "ios", apple: "ios", mobile: "ios",
  nav: "navbar", navigation: "navbar", header: "navbar",
  cta: "cta", faq: "faq", testimonial: "testimonials",
  price: "pricing", plans: "pricing", tiers: "pricing",
};

/* Arabic, keyed by normalized form (see arNorm) — what people type, not only the taxonomy's names */
const SYNONYMS_AR: Record<string, string> = {
  بنك: "fintech", بنوك: "fintech", مصرف: "fintech", مصرفي: "fintech", مالي: "fintech", ماليه: "fintech", دفع: "fintech", مدفوعات: "fintech",
  داكن: "dark", داكنه: "dark", مظلم: "dark", ليلي: "dark", فاتح: "light", فاتحه: "light",
  بسيط: "minimal", بسيطه: "minimal", فاخر: "luxury", فاخره: "luxury", مرح: "playful", مستقبلي: "futuristic",
  اسعار: "pricing", تسعير: "pricing", باقات: "pricing", خطط: "pricing",
  متجر: "ecommerce", تسوق: "ecommerce", "تجاره الكترونيه": "ecommerce",
  هبوط: "landing-page", "صفحه هبوط": "landing-page", "صفحه رئيسيه": "landing-page",
  "لوحه تحكم": "dashboard", تحكم: "dashboard", تحليلات: "dashboard",
  دخول: "auth", "تسجيل دخول": "auth", "تسجيل الدخول": "auth",
  صحه: "healthcare", صحي: "healthcare", طبي: "healthcare", عياده: "healthcare",
  تعليم: "education", تعليمي: "education", تعليميه: "education",
  سفر: "travel", سياحه: "travel", طيران: "travel", فنادق: "travel",
  عقار: "real-estate", عقارات: "real-estate", ازياء: "fashion", موضه: "fashion",
  طعام: "food", مطاعم: "food", توصيل: "food", اكل: "food",
  "ذكاء اصطناعي": "ai", مدونه: "blog", توثيق: "docs", جوال: "ios", ايفون: "ios",
  تنقل: "navbar", "شريط تنقل": "navbar", افتتاحي: "hero", "قسم افتتاحي": "hero", هيرو: "hero", تذييل: "footer", فوتر: "footer",
};

/**
 * Arabic spelled the way people actually type it: no diacritics or tatweel, every alef form as
 * ا, taa marbuta as ه, alef maqsura as ي, and «ال» dropped from the front of each word.
 */
export function arNorm(s: string) {
  return s
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .split(" ")
    .map((w) => w.replace(/^ال(?=..)/, ""))
    .join(" ");
}

/**
 * The values each dimension has items for, so a word never parses into a filter that matches
 * nothing — "saas" is both a Type and an Industry, and only the Industry has items. The server
 * works it out from the catalogue (lib/query PRESENT) and hands it to the browser: a few dozen
 * words instead of the catalogue itself.
 */
export type Present = Record<Dimension, string[]>;

const LISTS: [Dimension, readonly Term[]][] = [
  ["category", CATEGORIES], ["component", COMPONENT_TYPES], ["industry", INDUSTRIES],
  ["style", STYLES], ["tech", TECHNOLOGIES], ["platform", PLATFORMS],
];
const TERMS = new WeakMap<Present, { list: readonly Term[]; param: Dimension; values: Set<string> }[]>();
const termsFor = (present: Present) =>
  TERMS.get(present) ??
  TERMS.set(present, LISTS.map(([param, list]) => ({ list, param, values: new Set(present[param]) }))).get(present)!;

/* Arabic taxonomy names, normalized once instead of on every candidate phrase of every keystroke */
const AR = new Map<string, string>();
const arOf = (name: string) => AR.get(name) ?? AR.set(name, arNorm(name)).get(name)!;

/** Understands English and Arabic whatever the page language; `lang` only picks the chip labels. */
export function parseTerms(q: string, lang: Lang, present: Present): { terms: ParsedTerm[]; residual: string } {
  const raw = q.toLowerCase().trim();
  if (!raw) return { terms: [], residual: "" };
  const tokens = raw.split(/\s+/);
  const terms: ParsedTerm[] = [];
  const used = new Set<number>();
  const taken = new Set<string>();

  /* a phrase matches by name ("real estate", «العقارات») or by slug, typed with spaces or hyphens */
  const match = (phrase: string) => {
    const ar = arNorm(phrase);
    const norm = SYNONYMS[phrase] ?? SYNONYMS[phrase.replace(/ /g, "-")] ?? SYNONYMS_AR[ar] ?? phrase;
    const slug = norm.replace(/ /g, "-");
    for (const d of termsFor(present)) {
      if (taken.has(d.param)) continue;
      const hit = d.list.find(
        (t) => (t.slug === slug || t.name.toLowerCase() === norm || (t.ar !== undefined && arOf(t.ar) === ar)) && d.values.has(t.slug),
      );
      if (hit) return { d, hit };
    }
    return null;
  };

  /* longest phrases first, so "real estate" and «لوحة تحكم» aren't read (or missed) word by word */
  for (let i = 0; i < tokens.length; i++) {
    for (const len of [3, 2, 1]) {
      if (i + len > tokens.length) continue;
      const phrase = tokens.slice(i, i + len).join(" ");
      const m = match(phrase);
      if (!m) continue;
      terms.push({
        label: name(m.d.list, m.hit.slug, lang),
        param: m.d.param,
        value: m.hit.slug,
        word: phrase,
      });
      for (let k = i; k < i + len; k++) used.add(k);
      taken.add(m.d.param);
      i += len - 1;
      break;
    }
  }

  const residual = tokens.filter((_, i) => !used.has(i)).join(" ");
  return { terms, residual };
}
