import records from "@/content/craft.json";
import type { Archetype, Item, Source } from "./data";
import type { Palette } from "./palettes";

/**
 * Uiverse Originals: interactive pieces made here — widgets, loaders, generative backgrounds,
 * hero templates. Each is one self-contained HTML file in public/craft/ (no requests, no
 * dependencies), shown running in a sandboxed frame, and its source is the code you copy. They
 * are first-party, so unlike captures they carry code (docs/07 §5.1).
 *
 * `npm run craft:posters` renders the still a feed card shows before the piece runs.
 */

export type Live = {
  /** the piece itself, served from public/ */
  src: string;
  /** the still for feed cards: a JPEG of the piece at `w` × `h`, `scale` times as many pixels */
  poster: string;
  w: number;
  h: number;
  scale: number;
  titleAr: string;
  about: string;
  aboutAr: string;
  dir: "ltr" | "rtl";
};

type CraftRecord = {
  slug: string;
  kind: "component" | "screen";
  componentType?: string;
  archetype?: string;
  category: string;
  industry: string;
  style: string;
  dir?: string;
  title: string;
  titleAr: string;
  about: string;
  aboutAr: string;
  palette: Pick<Palette, "bg" | "surface" | "text" | "muted" | "accent" | "dark">;
  /** how the poster is taken: wait (ms), then hover / click / type into the page */
  poster: { wait?: number; hover?: string; click?: string; type?: string; viewport?: [number, number] };
  days: number;
  weight: number;
};

export const CRAFT_RECORDS = records as CraftRecord[];

export const ORIGINALS: Source = {
  slug: "uiverse-originals",
  name: "Uiverse Originals",
  domain: "uiverse.tech",
  industry: "saas",
  style: "minimal",
  tech: ["html"],
  palette: "craft",
  tagline: "Made here, free to use",
  about: "Interactive pieces made by Uiverse: one HTML file each, no dependencies, free to use and adapt under MIT.",
};

/* a hero is drawn at a laptop's width; a widget in a frame its size */
export const craftViewport = (r: CraftRecord): [number, number] => r.poster.viewport ?? (r.kind === "screen" ? [1440, 900] : [800, 600]);
/* posters are sharp at a card's width: small frames are taken at 1.5× */
export const craftScale = (r: CraftRecord) => (craftViewport(r)[0] >= 1200 ? 1 : 1.5);

export function craftItems(): Item[] {
  return CRAFT_RECORDS.map((r) => {
    const [w, h] = craftViewport(r);
    const p = r.palette;
    const palette: Palette = {
      key: `craft-${r.slug}`,
      name: r.title,
      bg: p.bg, surface: p.surface, raised: p.surface, text: p.text, muted: p.muted,
      accent: p.accent, accentFg: p.dark ? p.bg : "#ffffff", border: p.muted,
      chart: [p.accent, p.text, p.muted, p.surface], dark: p.dark,
    };
    const id = `o-${r.slug}`;
    return {
      id,
      slug: id,
      kind: r.kind,
      title: r.title,
      archetype: (r.archetype ?? "saas-landing") as Archetype,
      source: ORIGINALS,
      palette,
      aspect: w / h,
      category: r.category,
      industry: r.industry,
      style: r.style,
      platform: "web",
      device: "desktop",
      tech: ["html"],
      componentType: r.componentType,
      blocks: [],
      hasCode: true,
      tier: "free",
      responsive: true,
      has3d: false,
      weight: r.weight,
      daysAgo: r.days,
      colors: [p.bg, p.surface, p.accent, p.text, p.muted],
      live: {
        src: `/craft/${r.slug}.html`,
        poster: `/craft/posters/${r.slug}.jpg`,
        w,
        h,
        scale: craftScale(r),
        titleAr: r.titleAr,
        about: r.about,
        aboutAr: r.aboutAr,
        dir: r.dir === "rtl" ? "rtl" : "ltr",
      },
    } satisfies Item;
  });
}
