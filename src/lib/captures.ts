import records from "@/content/captures.json";
import optout from "@/content/optout.json";
import { normalizeDomain, onDomain } from "./domain";
import type { Archetype, Block, Item, Source } from "./data";
import type { Palette } from "./palettes";

/**
 * Real captures, written by `npm run capture` (scripts/capture/). Each record is a
 * live page rendered at three widths and measured, so unlike the procedural
 * previews every number here — colour roles, type scale, spacing, block bounds,
 * responsive rules — was read off the page itself.
 */

export type Viewport = "desktop" | "tablet" | "mobile";
export type Shot = { src: string; w: number; h: number; css: number; cssH: number; docH: number };
export type Crop = { y: number; h: number };

export type Capture = {
  url: string;
  capturedAt: string;
  dir: "ltr" | "rtl";
  lang: string;
  fonts: { heading: string; body: string };
  type: { name: string; size: number; weight: number; use: string; sample?: string }[];
  body: string;
  rhythm: { base: number; spacing: number[]; radius: string; container: string };
  responsive: [label: string, rule: string, blocks: string[]][];
  shots: Record<Viewport, Shot>;
  /** for a component: where the block sits at each width, as fractions of the page */
  crops?: Partial<Record<Viewport, Crop>>;
};

type CapturedBlock = Block & { y: number; h: number; px: { y: number; h: number } };

type CaptureRecord = {
  slug: string;
  url: string;
  capturedAt: string;
  title: string;
  source: { slug: string; name: string; domain: string; about: string; tagline: string };
  category: string;
  archetype: string;
  industry: string;
  style: string;
  tech: string[];
  dir: string;
  lang: string;
  palette: Omit<Palette, "key" | "name">;
  type: { scale: Capture["type"]; body: string; fonts: Capture["fonts"] };
  rhythm: Capture["rhythm"];
  blocks: CapturedBlock[];
  crops: Partial<Record<Viewport, { type: string; y: number; h: number; heading?: string }[]>>;
  responsive: Capture["responsive"];
  shots: Record<Viewport, Shot>;
};

/* blocks worth a standalone component entry — "section" and "feature" are too generic to browse */
const CROPPABLE = new Set([
  "navbar", "hero", "logo-cloud", "cards", "stats", "testimonials", "pricing", "faq",
  "cta", "footer", "login", "signup", "table", "sidebar", "inputs",
]);

/**
 * Domains whose owners opted out (docs/08 §4). One entry removes everything captured from the
 * domain and its subdomains — feed, detail, search, sitemap, MCP — since all of them read the
 * items built here. `npm run capture -- --opt-out <domain>` writes it and deletes the files;
 * the record stays here so a later capture run refuses the domain.
 */
export type OptOut = { domain: string; removedAt: string; ref?: string };
const OPTED_OUT = (optout as OptOut[]).map((o) => o.domain);
export const optedOut = (domain: string) => {
  const d = normalizeDomain(domain);
  return OPTED_OUT.some((o) => onDomain(d, o));
};

const DAY = 86400000;
const key = (h: string) => h.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 24);

export function capturedItems(): { items: Item[]; sources: Source[] } {
  const sources = new Map<string, Source>();
  const items: Item[] = [];

  for (const r of records as unknown as CaptureRecord[]) {
    if (optedOut(r.source.domain)) continue;
    const source: Source = sources.get(r.source.slug) ?? {
      ...r.source,
      industry: r.industry,
      style: r.style,
      tech: r.tech,
      palette: `cap-${r.slug}`,
      about: r.source.about || `${r.source.name}, captured from ${r.source.domain}.`,
    };
    sources.set(source.slug, source);

    const palette: Palette = { key: `cap-${r.slug}`, name: `${r.source.name} ${r.title}`, ...r.palette };
    const desktop = r.shots.desktop;
    const capture: Capture = {
      url: r.url,
      capturedAt: r.capturedAt,
      dir: r.dir === "rtl" ? "rtl" : "ltr",
      lang: r.lang,
      fonts: r.type.fonts,
      type: r.type.scale,
      body: r.type.body,
      rhythm: r.rhythm,
      responsive: r.responsive,
      shots: r.shots,
    };
    const daysAgo = Math.max(0, Math.floor((Date.now() - Date.parse(r.capturedAt)) / DAY));
    const id = `x-${r.slug}`;

    const screen: Item = {
      id,
      slug: id,
      kind: "screen",
      title: r.title,
      archetype: r.archetype as Archetype,
      source,
      palette,
      /* the feed shows the top of the page; the detail frame scrolls the whole thing */
      aspect: Math.max(desktop.css / desktop.cssH, 0.5),
      category: r.category,
      industry: r.industry,
      style: r.style,
      platform: "web",
      device: "desktop",
      tech: r.tech,
      blocks: r.blocks.map(({ type, label, heading, columns }) => ({ type, label, heading, columns })),
      hasCode: false,
      tier: "free",
      responsive: true,
      has3d: false,
      saves: 0,
      views: 0,
      daysAgo,
      colors: [palette.bg, palette.surface, palette.accent, palette.text, palette.muted],
      capture,
    };
    items.push(screen);

    const seen: Record<string, number> = {};
    for (const b of r.blocks) {
      const nth = (seen[b.type] = (seen[b.type] ?? -1) + 1);
      /* skip blocks the screenshot was cut before reaching */
      if (!CROPPABLE.has(b.type) || b.px.y + b.px.h > desktop.cssH) continue;
      const crops: Partial<Record<Viewport, Crop>> = { desktop: { y: b.y, h: b.h } };
      for (const vp of ["tablet", "mobile"] as const) {
        /* same heading first — a hero can classify differently at 390px — then same type in order */
        const list = r.crops[vp] ?? [];
        const match = (b.heading && list.find((c) => c.heading && key(c.heading) === key(b.heading!))) || list.filter((c) => c.type === b.type)[nth];
        if (match && (match.y + match.h) * r.shots[vp].docH <= r.shots[vp].cssH) crops[vp] = { y: match.y, h: match.h };
      }
      const cslug = `${id}-${b.type}${nth ? `-${nth + 1}` : ""}`;
      items.push({
        ...screen,
        id: cslug,
        slug: cslug,
        kind: "component",
        title: b.label,
        componentType: b.type,
        parentSlug: screen.slug,
        crop: crops.desktop,
        aspect: Math.min(Math.max(desktop.css / b.px.h, 0.6), 4),
        blocks: [{ type: b.type, label: b.label, heading: b.heading, columns: b.columns }],
        capture: { ...capture, crops },
      });
    }
  }

  return { items, sources: [...sources.values()] };
}
