import type { Item, LAYOUTS, PALETTE_ITEMS } from "./data";
import type { PromptOptions } from "./prompt";

/**
 * Layouts and palettes as items the prompt generator takes. Both are derived from an example
 * screen, and both drop its capture: a layout is the section order and a palette is the colours,
 * so neither should carry a real page's measurements, fonts or headings into a prompt.
 */

/* a captured block label can carry the page's own heading ("Hero: Pay later") — keep the type name */
const plain = (example: Item, blocks = example.blocks): Item => ({
  ...example,
  capture: undefined,
  blocks: blocks.map((b) => ({ type: b.type, label: b.label.replace(/:.*$/, "") })),
});

export const layoutItem = (l: (typeof LAYOUTS)[number]): Item => ({
  ...plain(l.example, l.sections),
  kind: "layout",
  slug: l.slug,
  title: l.name,
});

export const paletteItem = (p: (typeof PALETTE_ITEMS)[number]): Item => ({
  ...plain(p.example),
  kind: "palette",
  slug: p.slug,
  title: p.palette.name,
});

/** A layout is structure: lead with the sections, leave colour to the project. */
export const LAYOUT_DEFAULTS: Partial<PromptOptions> = { includeTokens: false };
/** A palette is colour and type: the page around it is the model's to choose. */
export const PALETTE_DEFAULTS: Partial<PromptOptions> = { includeSections: false, includeLayout: false };
