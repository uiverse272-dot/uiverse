import type { Lang } from "@/i18n/config";
import { dirOf, ITEMS, type Item } from "./data";
import { paramFilter, SCOPES, type Filters, type Scope } from "./filters";
import { arNorm, parseTerms, type Present } from "./parse";
import { lookDistance } from "./look";

export * from "./filters";
export * from "./parse";


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
    /* originals: findable by what they do, and as the live, copyable kind */
    ...(i.live
      ? [i.live.about, i.live.titleAr, "original live interactive animated code copy uiverse", i.live.dir === "rtl" ? "rtl right-to-left arabic عربي عربيه" : ""]
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
  if (f.dir) out = out.filter((i) => dirOf(i) === f.dir);
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

const values = (f: (i: Item) => string | string[] | undefined) => [...new Set(ITEMS.flatMap((i) => f(i) ?? []))];
/** what the catalogue has in each dimension — the search box gets this rather than the catalogue */
export const PRESENT: Present = {
  category: values((i) => i.category),
  component: values((i) => i.componentType),
  industry: values((i) => i.industry),
  style: values((i) => i.style),
  tech: values((i) => i.tech),
  platform: values((i) => i.platform),
};

export const parseQuery = (q: string, lang: Lang = "en") => parseTerms(q, lang, PRESENT);

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

/**
 * "More like this" under a design: the same kind, ranked by what it is (industry, style, type,
 * stack, source) and by how it looks — its colours, by the distance image search uses — on the
 * same device. Real captures edge out samples on a tie.
 */
export function similarTo(item: Item, n = 8) {
  return ITEMS.filter((i) => i.slug !== item.slug && i.kind === item.kind)
    .map((i) => {
      let score = 0;
      if (i.industry === item.industry) score += 3;
      if (i.style === item.style) score += 3;
      if (i.category === item.category) score += 2;
      if (i.componentType && i.componentType === item.componentType) score += 2;
      if (i.device === item.device) score += 2;
      if (i.source.slug === item.source.slug) score += 1;
      score += i.tech.filter((t) => item.tech.includes(t)).length;
      score -= 4 * lookDistance(item.palette, i);
      if (i.capture) score += 0.5;
      return { i, score };
    })
    .sort((a, b) => b.score - a.score || b.i.weight - a.i.weight)
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
