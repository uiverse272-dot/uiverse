import type { Lang } from "@/i18n/config";
import { ITEMS, type Item } from "./data";
import { CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES, COMPONENT_TYPES, PLATFORMS, name, type Term } from "./taxonomy";

export type Filters = {
  kind?: string;
  q?: string;
  category?: string;
  componentType?: string;
  industry?: string;
  style?: string;
  tech?: string;
  platform?: string;
  device?: string;
  code?: string;
  tier?: string;
  responsive?: string;
  threed?: string;
  /** text direction — only real captures are measured; procedural previews are all ltr */
  dir?: string;
  source?: string;
  sort?: string;
};

/** URL param → Filters key. Only two differ: `component` and `3d` read better in a URL. */
const KEYS: Record<string, keyof Filters> = {
  kind: "kind", q: "q", category: "category", component: "componentType", industry: "industry",
  style: "style", tech: "tech", platform: "platform", device: "device", code: "code", tier: "tier",
  responsive: "responsive", "3d": "threed", dir: "dir", source: "source", sort: "sort",
};

export const filterKey = (param: string) => KEYS[param];

export function filtersFromParams(sp: Record<string, string | string[] | undefined>): Filters {
  const f: Filters = {};
  for (const [param, key] of Object.entries(KEYS)) {
    const v = sp[param];
    f[key] = Array.isArray(v) ? v[0] : v;
  }
  return f;
}

/** One URL param (`component=hero`) as Filters (`{ componentType: "hero" }`), with no other keys. */
export const paramFilter = (param: string, value: string): Filters => ({ [KEYS[param]]: value });

/** What each browse feed contains. Pages and every link into them share these, so counts can't drift. */
export const SCOPES = {
  web: { path: "/web", base: { kind: "screen", platform: "web" } },
  apps: { path: "/apps", base: { kind: "screen", device: "mobile" } },
  components: { path: "/components", base: { kind: "component" } },
} satisfies Record<string, { path: string; base: Filters }>;
export type Scope = keyof typeof SCOPES;

/**
 * A link for one URL filter (`category=onboarding`) into the first feed, in `order`, that has
 * results for it — with the count that feed will show. Null when no feed has any.
 */
export function browseLink(param: string, value: string, order: Scope[] = ["web", "apps", "components"]) {
  const f = paramFilter(param, value);
  for (const s of order) {
    const items = applyFilters(ITEMS, { ...SCOPES[s].base, ...f });
    if (items.length) {
      return { href: `${SCOPES[s].path}?${param}=${encodeURIComponent(value)}`, count: items.length, cover: items[0] };
    }
  }
  return null;
}

const textOf = (i: Item) =>
  [
    i.title, i.source.name, i.source.tagline, i.category, i.industry, i.style, i.componentType ?? "", ...i.tech,
    /* real captures: findable by direction ("rtl", "arabic") and by what their sections say */
    ...(i.capture
      ? [i.capture.dir, i.capture.dir === "rtl" ? "right-to-left arabic عربي عربيه" : "", i.capture.lang, "real captured live", ...i.blocks.map((b) => b.heading ?? "")]
      : []),
  ]
    .join(" ")
    .toLowerCase()
    .normalize("NFC");

/* the catalogue is static, so each item's normalized search text is built once, not per query */
const TEXT = new Map(ITEMS.map((i) => [i, arNorm(textOf(i))]));
const searchText = (i: Item) => TEXT.get(i) ?? arNorm(textOf(i));

export function applyFilters(items: Item[], f: Filters): Item[] {
  let out = items;
  if (f.kind) out = out.filter((i) => i.kind === f.kind);
  if (f.category) out = out.filter((i) => i.category === f.category);
  if (f.componentType) out = out.filter((i) => i.componentType === f.componentType);
  if (f.industry) out = out.filter((i) => i.industry === f.industry);
  if (f.style) out = out.filter((i) => i.style === f.style);
  if (f.tech) out = out.filter((i) => i.tech.includes(f.tech!));
  if (f.platform) out = out.filter((i) => i.platform === f.platform);
  if (f.device) out = out.filter((i) => i.device === f.device);
  if (f.source) out = out.filter((i) => i.source.slug === f.source);
  if (f.code === "true") out = out.filter((i) => i.hasCode);
  if (f.tier) out = out.filter((i) => i.tier === f.tier);
  if (f.responsive === "true") out = out.filter((i) => i.responsive);
  if (f.threed === "true") out = out.filter((i) => i.has3d);
  if (f.dir) out = out.filter((i) => (i.capture?.dir ?? "ltr") === f.dir);
  if (f.q) {
    const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean).map(arNorm);
    out = out.filter((i) => {
      const t = searchText(i);
      return terms.every((term) => t.includes(term));
    });
  }
  return sortItems(out, f.sort);
}

/** "new", else Featured: the catalogue's fixed weight, eased by age. Unknown sorts (old links to "trending", "saved", "views") get Featured. */
export function sortItems(items: Item[], sort = "featured") {
  const score: (i: Item) => number = sort === "new" ? (i) => -i.daysAgo : (i) => i.weight / (i.daysAgo + 12);
  return spread([...items].sort((a, b) => score(b) - score(a)), score);
}

/**
 * Among items that tie on score, don't run one source's items back to back. Real captures all
 * start at zero weight, so without this a fresh batch lists every crop of one site, then the next.
 */
function spread(sorted: Item[], score: (i: Item) => number, window = 40) {
  const rest = [...sorted];
  const out: Item[] = [];
  while (rest.length) {
    const prev = out[out.length - 1]?.source.slug;
    const s = score(rest[0]);
    let k = 0;
    for (let j = 0; j < Math.min(rest.length, window) && score(rest[j]) === s; j++) {
      if (rest[j].source.slug !== prev) {
        k = j;
        break;
      }
    }
    out.push(...rest.splice(k, 1));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Natural-language query parsing                                      */
/* Dictionary-first: deterministic, explainable, and reusable as URL    */
/* state. The parsed terms are shown back to the user as chips.         */
/* ------------------------------------------------------------------ */

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

/* `values` holds what the index actually contains, so a word never parses into a filter that matches
   nothing — "saas" is both a Type and an Industry, and only the Industry has items. */
const TERMS: { list: readonly Term[]; param: Dimension; values: Set<string> }[] = [
  { list: CATEGORIES, param: "category", values: new Set(ITEMS.map((i) => i.category)) },
  { list: COMPONENT_TYPES, param: "component", values: new Set(ITEMS.map((i) => i.componentType ?? "")) },
  { list: INDUSTRIES, param: "industry", values: new Set(ITEMS.map((i) => i.industry)) },
  { list: STYLES, param: "style", values: new Set(ITEMS.map((i) => i.style)) },
  { list: TECHNOLOGIES, param: "tech", values: new Set(ITEMS.flatMap((i) => i.tech)) },
  { list: PLATFORMS, param: "platform", values: new Set(ITEMS.map((i) => i.platform)) },
];

/* Arabic taxonomy names, normalized once instead of on every candidate phrase of every keystroke */
const AR = new Map<string, string>();
const arOf = (name: string) => AR.get(name) ?? AR.set(name, arNorm(name)).get(name)!;

/** Understands English and Arabic whatever the page language; `lang` only picks the chip labels. */
export function parseQuery(q: string, lang: Lang = "en"): { terms: ParsedTerm[]; residual: string } {
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
    for (const d of TERMS) {
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

export function searchItems(q: string, extra: Filters = {}, lang: Lang = "en") {
  const { terms, residual } = parseQuery(q, lang);
  const f: Filters = { ...extra };
  for (const t of terms) {
    const key = ({ category: "category", component: "componentType", industry: "industry", style: "style", tech: "tech", platform: "platform" } as Record<string, keyof Filters>)[t.param];
    if (key && !f[key]) (f as Record<string, string>)[key] = t.value;
  }
  let results = applyFilters(ITEMS, { ...f, q: undefined });
  if (residual) {
    const rt = residual.split(/\s+/).filter(Boolean).map(arNorm);
    const narrowed = results.filter((i) => rt.every((term) => searchText(i).includes(term)));
    /* residual is a recall booster, not a hard gate — fall back if it kills everything */
    if (narrowed.length > 0) results = narrowed;
  }
  /* already sorted by applyFilters (extra.sort rides along in f); narrowing keeps the order */
  return { results, terms, residual };
}

export function facetCounts(items: Item[], key: "industry" | "style" | "category") {
  const m = new Map<string, number>();
  for (const i of items) m.set(i[key], (m.get(i[key]) ?? 0) + 1);
  return m;
}

export function similarTo(item: Item, n = 8) {
  return ITEMS.filter((i) => i.slug !== item.slug)
    .map((i) => {
      let score = 0;
      if (i.kind === item.kind) score += 2;
      if (i.industry === item.industry) score += 3;
      if (i.style === item.style) score += 3;
      if (i.category === item.category) score += 2;
      if (i.palette.key === item.palette.key) score += 2;
      if (i.source.slug === item.source.slug) score += 1;
      score += i.tech.filter((t) => item.tech.includes(t)).length;
      return { i, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.i);
}

/**
 * Home mixes kinds deliberately: full screens carry the feed, components are
 * injected at a steady cadence. Without this, derived components outnumber
 * screens and the feed reads as a component library instead of discovery.
 */
export function mixFeed(items: Item[], every = 4) {
  const screens = items.filter((i) => i.kind !== "component");
  const comps = items.filter((i) => i.kind === "component");
  const out: Item[] = [];
  let c = 0;
  screens.forEach((s, i) => {
    out.push(s);
    if ((i + 1) % every === 0 && c < comps.length) out.push(comps[c++]);
  });
  return out.concat(comps.slice(c));
}
