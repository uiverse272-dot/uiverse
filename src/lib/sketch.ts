import { ARCHETYPES, type Archetype, type Block } from "./archetypes";
import type { Item, Source } from "./data";
import type { Palette } from "./palettes";
import { COMPONENT_TYPES, name } from "./taxonomy";

/**
 * A wireframe drawn as boxes, turned into an item the prompt generator already understands.
 *
 * Nothing here reads strokes or calls a model: each box is a block type, guessed from where it
 * sits and how it's shaped, and shown to the person drawing so a wrong guess is one click to fix.
 * The drawing's order and types pick the closest archetype, which supplies the category and the
 * responsive rules the prompt states.
 */

export type Device = "desktop" | "mobile";
/** Frame-relative, 0–1 on both axes, so a sketch survives a resize or a device switch */
export type Box = { id: string; x: number; y: number; w: number; h: number; type: string };

/* the block types the prompt has a written treatment for (lib/spec BLOCK_NOTES) */
export const SKETCH_TYPES = [
  "navbar", "sidebar", "hero", "logo-cloud", "cards", "stats", "charts", "table", "list", "testimonials",
  "pricing", "faq", "cta", "footer", "login", "inputs", "checkout", "filters", "search", "tabs", "breadcrumb", "modal",
] as const;

/** Frame width over height. Desktop is a scrolled page, not one viewport — sketches run long. */
export const FRAME: Record<Device, number> = { desktop: 1440 / 1800, mobile: 390 / 844 };

/** The likeliest block type for a box, from its position, shape and what is already drawn. */
export function guessType(box: Omit<Box, "type" | "id">, device: Device, others: Box[] = []): string {
  const { x, y, w, h } = box;
  const has = (t: string) => others.some((o) => o.type === t);
  const bottom = y + h;
  const wide = w > 0.6;

  if (device === "mobile") {
    if (y < 0.1 && h < 0.12 && wide) return "navbar";
    if (bottom > 0.9 && h < 0.12 && wide) return "tabs";
    if (h < 0.08 && wide) return "filters";
    if (!has("stats") && !has("hero") && y < 0.45 && h > 0.12) return has("navbar") ? "stats" : "hero";
    return w / h > 2.2 ? "list" : "cards";
  }

  if (h > 0.45 && w < 0.3 && (x < 0.06 || x + w > 0.94)) return "sidebar";
  if (y < 0.08 && h < 0.1 && w > 0.5) return "navbar";
  if (bottom > 0.9 && h < 0.25 && wide) return "footer";
  if (w < 0.5 && h > 0.2 && x > 0.15 && x + w < 0.85 && !has("sidebar")) return "login";
  if (has("sidebar")) {
    if (h < 0.18 && w / h > 2.5) return "stats";
    return w / h > 1.6 ? "table" : "charts";
  }
  if (!has("hero") && y < 0.45 && wide && h > 0.12) return "hero";
  if (h < 0.06 && wide) return "logo-cloud";
  if (h < 0.11 && wide) return "stats";
  if (h < 0.2 && wide) return "cta";
  return "cards";
}

/** Reading order: a sidebar first (it frames everything), then top to bottom, left to right within a row. */
export function ordered(boxes: Box[]): Box[] {
  return [...boxes].sort((a, b) => {
    const side = Number(b.type === "sidebar") - Number(a.type === "sidebar");
    if (side) return side;
    /* boxes whose tops are within 2% are one row */
    return Math.abs(a.y - b.y) < 0.02 ? a.x - b.x : a.y - b.y;
  });
}

/** The archetype on this device whose sections best match the drawing — set overlap, then order. */
export function closestArchetype(types: string[], device: Device): Archetype {
  const drawn = new Set(types);
  let best: Archetype = device === "mobile" ? "mobile-feed" : "saas-landing";
  let bestScore = -1;
  for (const [key, a] of Object.entries(ARCHETYPES) as [Archetype, (typeof ARCHETYPES)[Archetype]][]) {
    if (a.device !== device) continue;
    const theirs = a.blocks.map((b) => b.type);
    const own = new Set(theirs);
    const shared = [...drawn].filter((t) => own.has(t)).length;
    const jaccard = shared / new Set([...drawn, ...own]).size;
    /* same first block breaks ties — a page that opens with a sidebar is an app, not a landing page */
    const score = jaccard + (theirs[0] === types[0] ? 0.05 : 0);
    if (score > bestScore) {
      best = key;
      bestScore = score;
    }
  }
  return best;
}

/** Blocks for a drawing: labelled by type, numbered when a type repeats ("Cards", "Cards 2") */
export function sketchBlocks(boxes: Box[]): Block[] {
  const seen: Record<string, number> = {};
  return ordered(boxes).map((b) => {
    seen[b.type] = (seen[b.type] ?? 0) + 1;
    const label = name(COMPONENT_TYPES, b.type);
    return { type: b.type, label: seen[b.type] > 1 ? `${label} ${seen[b.type]}` : label };
  });
}

/** Lay an archetype's sections out as boxes — a starting point the person then redraws. */
export function boxesFrom(archetype: Archetype): Box[] {
  const a = ARCHETYPES[archetype];
  const sidebar = a.blocks.some((b) => b.type === "sidebar");
  const rest = a.blocks.filter((b) => b.type !== "sidebar");
  const weight = (t: string) => (t === "hero" ? 3 : t === "navbar" || t === "tabs" || t === "breadcrumb" ? 0.6 : t === "footer" ? 1.2 : 1.6);
  const sum = rest.reduce((s, b) => s + weight(b.type), 0);
  const pad = 0.015;
  const left = sidebar ? 0.2 : 0;
  let y = 0;
  const out: Box[] = sidebar ? [{ id: "b0", x: 0, y: 0, w: 0.18, h: 1, type: "sidebar" }] : [];
  rest.forEach((b, i) => {
    const h = weight(b.type) / sum;
    out.push({ id: `b${i + 1}`, x: left, y: y + pad / 2, w: 1 - left, h: h - pad, type: b.type });
    y += h;
  });
  return out;
}

/** `archetype` overrides the closest match — the person drawing knows what page it is */
export type SketchOptions = { device: Device; palette: Palette; industry: string; style: string; archetype?: Archetype };

/* deterministic, so the same drawing is the same prompt — and the same free-prompt credit */
const fnv = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
};

/**
 * The drawing as an item. Its source is the person drawing, not a brand — there is no capture,
 * so every section note is the generator's written treatment for that block type.
 */
export function sketchItem(boxes: Box[], opts: SketchOptions, sourceName = "Sketch"): Item {
  const blocks = sketchBlocks(boxes);
  const archetype =
    opts.archetype && ARCHETYPES[opts.archetype].device === opts.device
      ? opts.archetype
      : closestArchetype(blocks.map((b) => b.type), opts.device);
  const a = ARCHETYPES[archetype];
  const mobile = opts.device === "mobile";
  const source: Source = {
    slug: "sketch", name: sourceName, domain: "", industry: opts.industry, style: opts.style,
    tech: [], palette: opts.palette.key, tagline: "", about: "",
  };
  const key = [opts.device, archetype, opts.palette.key, opts.industry, opts.style, ...blocks.map((b) => b.type)].join("|");
  return {
    id: "sketch",
    slug: `sketch-${fnv(key)}`,
    kind: "screen",
    title: sourceName,
    archetype,
    source,
    palette: opts.palette,
    aspect: FRAME[opts.device],
    category: a.category,
    industry: opts.industry,
    style: opts.style,
    platform: mobile ? "ios" : "web",
    device: opts.device,
    tech: [],
    blocks,
    hasCode: false,
    tier: "free",
    responsive: true,
    has3d: false,
    weight: 0,
    daysAgo: 0,
    colors: [opts.palette.bg, opts.palette.surface, opts.palette.accent, opts.palette.text, opts.palette.muted],
  };
}
