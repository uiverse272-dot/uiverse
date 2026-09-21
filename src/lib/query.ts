import { ITEMS, type Item } from "./data";
import { CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES, COMPONENT_TYPES, PLATFORMS } from "./taxonomy";

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
  source?: string;
  sort?: string;
};

export function filtersFromParams(sp: Record<string, string | string[] | undefined>): Filters {
  const g = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  return {
    kind: g("kind"), q: g("q"), category: g("category"), componentType: g("component"),
    industry: g("industry"), style: g("style"), tech: g("tech"), platform: g("platform"),
    device: g("device"), code: g("code"), tier: g("tier"), responsive: g("responsive"),
    threed: g("3d"), source: g("source"), sort: g("sort"),
  };
}

const textOf = (i: Item) =>
  [i.title, i.source.name, i.source.tagline, i.category, i.industry, i.style, i.componentType ?? "", ...i.tech]
    .join(" ")
    .toLowerCase();

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
  if (f.q) {
    const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    out = out.filter((i) => {
      const t = textOf(i);
      return terms.every((term) => t.includes(term));
    });
  }
  return sortItems(out, f.sort);
}

export function sortItems(items: Item[], sort = "trending") {
  const c = [...items];
  switch (sort) {
    case "new":
      return c.sort((a, b) => a.daysAgo - b.daysAgo);
    case "saved":
      return c.sort((a, b) => b.saves - a.saves);
    case "views":
      return c.sort((a, b) => b.views - a.views);
    default:
      return c.sort(
        (a, b) => b.saves / (b.daysAgo + 12) - a.saves / (a.daysAgo + 12),
      );
  }
}

/* ------------------------------------------------------------------ */
/* Natural-language query parsing                                      */
/* Dictionary-first: deterministic, explainable, and reusable as URL    */
/* state. The parsed terms are shown back to the user as chips.         */
/* ------------------------------------------------------------------ */

export type ParsedTerm = { dimension: string; label: string; param: string; value: string };

const SYNONYMS: Record<string, string> = {
  landing: "landing-page", homepage: "landing-page", marketing: "landing-page",
  admin: "dashboard", analytics: "dashboard", console: "dashboard",
  shop: "ecommerce", store: "ecommerce", commerce: "ecommerce",
  signin: "auth", login: "auth", "log-in": "auth", signup: "auth",
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

const DICTS: { list: readonly { slug: string; name: string }[]; dimension: string; param: string }[] = [
  { list: CATEGORIES, dimension: "Type", param: "category" },
  { list: COMPONENT_TYPES, dimension: "Component", param: "component" },
  { list: INDUSTRIES, dimension: "Industry", param: "industry" },
  { list: STYLES, dimension: "Style", param: "style" },
  { list: TECHNOLOGIES, dimension: "Tech", param: "tech" },
  { list: PLATFORMS, dimension: "Platform", param: "platform" },
];

export function parseQuery(q: string): { terms: ParsedTerm[]; residual: string } {
  const raw = q.toLowerCase().trim();
  if (!raw) return { terms: [], residual: "" };
  const tokens = raw.split(/\s+/);
  const terms: ParsedTerm[] = [];
  const used = new Set<number>();
  const taken = new Set<string>();

  tokens.forEach((tok, idx) => {
    const norm = SYNONYMS[tok] ?? tok;
    for (const d of DICTS) {
      if (taken.has(d.param)) continue;
      const hit = d.list.find((t) => t.slug === norm || t.name.toLowerCase() === norm);
      if (hit) {
        terms.push({ dimension: d.dimension, label: hit.name, param: d.param, value: hit.slug });
        used.add(idx);
        taken.add(d.param);
        return;
      }
    }
  });

  const residual = tokens.filter((_, i) => !used.has(i)).join(" ");
  return { terms, residual };
}

export function searchItems(q: string, extra: Filters = {}) {
  const { terms, residual } = parseQuery(q);
  const f: Filters = { ...extra };
  for (const t of terms) {
    const key = ({ category: "category", component: "componentType", industry: "industry", style: "style", tech: "tech", platform: "platform" } as Record<string, keyof Filters>)[t.param];
    if (key && !f[key]) (f as Record<string, string>)[key] = t.value;
  }
  let results = applyFilters(ITEMS, { ...f, q: undefined });
  if (residual) {
    const rt = residual.split(/\s+/).filter(Boolean);
    const narrowed = results.filter((i) => rt.every((term) => textOf(i).includes(term)));
    /* residual is a recall booster, not a hard gate — fall back if it kills everything */
    if (narrowed.length > 0) results = narrowed;
  }
  return { results: sortItems(results, extra.sort), terms, residual };
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
