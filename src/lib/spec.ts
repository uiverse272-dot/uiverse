import type { Item } from "./data";

/**
 * The single derivation of a capture's design facts.
 *
 * Both the Breakdown tab and the prompt generator read from here. Deriving the
 * same numbers twice is how the two surfaces drift apart, and the prompt is only
 * trustworthy while it says exactly what the Breakdown shows.
 */

export type ColorRole = { key: string; label: string; token: string; value: string };
export type TypeStep = { name: string; size: number; weight: number; use: string };
export type Section = { index: number; label: string; type: string; note: string };

const ROLES: [keyof Item["palette"], string, string][] = [
  ["bg", "Background", "background"],
  ["surface", "Surface", "surface"],
  ["raised", "Raised", "raised"],
  ["border", "Border", "border"],
  ["text", "Text", "text"],
  ["muted", "Text muted", "text-muted"],
  ["accent", "Accent", "accent"],
  ["accentFg", "Accent foreground", "accent-fg"],
];

export function colorRoles(item: Item): ColorRole[] {
  return ROLES.map(([key, label, token]) => ({
    key: String(key),
    label,
    token,
    value: item.palette[key] as string,
  }));
}

const DESKTOP_TYPE: TypeStep[] = [
  { name: "Display", size: 68, weight: 600, use: "Hero headline" },
  { name: "H1", size: 48, weight: 600, use: "Section header" },
  { name: "H2", size: 38, weight: 600, use: "Sub-section" },
  { name: "H3", size: 22, weight: 560, use: "Card title" },
  { name: "Body", size: 15, weight: 430, use: "Paragraph" },
  { name: "Small", size: 13, weight: 450, use: "Meta, labels" },
  { name: "Caption", size: 11.5, weight: 500, use: "Eyebrow, badges" },
];

const MOBILE_TYPE: TypeStep[] = [
  { name: "Display", size: 34, weight: 600, use: "Screen headline" },
  { name: "H1", size: 28, weight: 600, use: "Section header" },
  { name: "H2", size: 21, weight: 600, use: "Card title" },
  { name: "Body", size: 15, weight: 430, use: "Paragraph" },
  { name: "Small", size: 13, weight: 450, use: "Meta, labels" },
  { name: "Caption", size: 11, weight: 500, use: "Tab labels" },
];

export const typeScale = (item: Item) => (item.device === "mobile" ? MOBILE_TYPE : DESKTOP_TYPE);

export const SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96];

export function layoutSpec(item: Item) {
  return item.device === "mobile"
    ? { container: "390px", columns: "single column", gutter: "22px", radius: "14 / 20px", body: "15px / 1.5" }
    : { container: "1440px", columns: "12 column", gutter: "24px", radius: "8 / 12 / 16px", body: "15px / 1.55" };
}

/** What each detected block actually looks like — the part a model cannot infer from a label. */
const BLOCK_NOTES: Record<string, string> = {
  navbar:
    "sticky, hairline bottom border, logo lockup left, four text links, ghost sign-in plus one solid CTA on the right",
  sidebar:
    "248px fixed column on surface, logo row, seven nav rows each with a small icon square, active row on the raised background, user row pinned to the bottom",
  hero: "centred; small pill eyebrow, two-line headline at display size, one muted sub-line, two buttons side by side, then a large bordered product preview",
  "logo-cloud": "one centred row of five muted wordmarks at roughly 22% opacity, with a small caption above",
  cards: "three equal bordered cards; each has an accent-tinted icon square, a title, three lines of body and a small accent link",
  stats: "four large numerals with small muted labels, hairline rules top and bottom of the band",
  charts: "bar chart with the accent colour for the primary series and a muted secondary series, range toggle top right",
  table: "header row, six body rows, avatar in the first cell, one status pill column, right-aligned numeric column",
  list: "rows of avatar plus two stacked lines with a right-aligned value",
  testimonials: "single centred quote at 30px on 1.45 line height, avatar and name beneath",
  pricing:
    "three tiers; the middle tier is emphasised with an accent border and a Popular badge, each has a large price, a button, and a feature list with small dot markers",
  faq: "four rows separated by hairlines, each a question with a plus affordance on the right",
  cta: "full-width raised band with generous radius, headline and one solid button, centred",
  footer: "brand lockup plus four columns of links, hairline rule above",
  login: "centred 380px card; logo, title, two labelled fields, solid submit, 'or' divider, two provider buttons",
  checkout: "two columns; the wider one holds grouped labelled fields and two selectable delivery rows, the narrower one holds the order summary",
  inputs: "labelled fields at 46px height with a hairline border and 9px radius",
  filters: "single row of pill filters, the first one active on the accent colour",
  search: "rounded field on the raised background with a leading icon",
  tabs: "segmented control on the raised background, active segment on surface",
  breadcrumb: "small muted path with slash separators, the final segment in full contrast",
  modal: "centred panel over a dimmed backdrop, close affordance top right",
};

export function sections(item: Item): Section[] {
  return item.blocks.map((b, i) => ({
    index: i + 1,
    label: b.label,
    type: b.type,
    note: BLOCK_NOTES[b.type] ?? "standard treatment for this block type",
  }));
}

export function responsiveRules(item: Item): [string, string][] {
  if (item.device === "mobile") {
    return [
      ["Safe areas", "respect top notch and bottom home indicator insets"],
      ["Tap targets", "44px minimum on every interactive element"],
      ["Tab bar", "fixed to the bottom, five items, active item on the accent colour"],
    ];
  }
  return [
    ["Navigation", "full nav → condensed → hamburger at 760px"],
    ["Feature grid", "3 columns → 2 → 1"],
    ["Hero type", "68px → 44px → 32px"],
    ["Container", "1440px max → fluid with 24px gutters"],
    ["Tables", "all columns → horizontal scroll → stacked rows"],
    ["Sticky rail", "sticky → inline above the content"],
  ];
}
