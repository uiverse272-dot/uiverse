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

/*
 * How each archetype reflows, read as "laptop → tablet → mobile". This is a
 * description of what src/components/mock/sections.tsx actually draws — change
 * one and you must change the other. The third field lists the block types a
 * rule belongs to, so a single component shows only the rules that apply to it.
 */
type Rule = [label: string, rule: string, blocks: string[]];

const WEB_NAV: Rule = ["Navigation", "links, sign-in and CTA → links fold into a menu button, sign-in and CTA stay → logo and menu button only", ["navbar"]];
const WEB_FOOTER: Rule = ["Footer", "brand beside 4 link columns → brand above 4 columns → brand above a 2 × 2 grid", ["footer"]];
const GUTTERS: Rule = ["Gutters", "56–64px → 32px → 20px", []];

const APP_NAV = (tabs: boolean): Rule =>
  tabs
    ? ["Navigation", "labelled left nav → labelled tab bar → icon tab bar", ["tabs", "navbar"]]
    : ["Navigation", "none — a single-step flow at every size", []];

const RULES: Record<Item["archetype"], Rule[]> = {
  "saas-landing": [
    WEB_NAV,
    ["Hero headline", "68px → 52px → 36px; CTAs side by side → side by side → stacked, full width", ["hero"]],
    ["Product shot", "sidebar and 3 stat tiles → narrower sidebar → no sidebar, 2 tiles", ["hero"]],
    ["Logo cloud", "5 in a row → 5, tighter → 4, wrapping", []],
    ["Feature grid", "3 columns → 2 (third card spans) → 1", ["cards"]],
    ["Metrics band", "4 across → 4 across, 34px figures → 2 × 2", ["stats"]],
    ["Testimonial", "30px quote with wide margins → 26px → 20px, full width", ["testimonials"]],
    ["CTA band", "38px heading → 32px → 24px", ["cta"]],
    WEB_FOOTER,
    GUTTERS,
  ],
  dashboard: [
    ["Sidebar", "248px with labels → 72px icon rail → hidden behind a menu button, bottom tab bar added", ["sidebar", "navbar"]],
    ["Top bar", "title, 232px search, actions → 180px search → menu button, title, actions", ["navbar"]],
    ["Stat cards", "4 across → 4 across, 22px values → 2 × 2", ["stats"]],
    ["Chart + activity", "side by side → stacked, full width → stacked, 16 bars", ["charts", "list"]],
    ["Data table", "5 columns → 4 (category dropped) → stacked rows with amount and status on the right", ["table"]],
  ],
  pricing: [
    WEB_NAV,
    ["Header", "48px → 40px → 30px", ["hero"]],
    ["Tiers", "3 across → 3 across, tighter → stacked; phones list the first 4 features", ["pricing"]],
    ["FAQ", "centred 840px → full width, 64px gutters → 20px gutters", []],
    WEB_FOOTER,
  ],
  ecommerce: [
    ["Navigation", "logo, links, search, icons → menu button, logo, search → menu button, logo, 2 icons", ["navbar"]],
    ["Campaign hero", "copy left, product right → same, smaller → product image above copy, full-width CTA", ["hero"]],
    ["Category row", "one row → one row → crops at the edge and scrolls", ["filters"]],
    ["Product grid", "4 columns → 3 → 2", ["cards"]],
    ["Editorial band", "38px heading → 32px → 24px", ["cta"]],
    WEB_FOOTER,
  ],
  portfolio: [
    ["Navigation", "3 links → 3 links → a single “Menu”", ["navbar"]],
    ["Type statement", "96px → 64px → 38px", ["hero"]],
    ["Work grid", "2 columns → 2 → 1", ["cards"]],
    ["Index list", "full-width rows at every size; titles shorten on phones", ["list"]],
    WEB_FOOTER,
  ],
  checkout: [
    ["Layout", "form beside order summary → same, tighter → summary folds into a “Show order summary” bar above the form", ["checkout", "list"]],
    ["Pay button", "full width of the form at every size", ["cta"]],
  ],
  auth: [
    ["Layout", "form beside the art panel → form alone, centred, 420px → form alone, full width, top aligned", ["login"]],
    ["Buttons", "full width of the card at every size", ["cta", "inputs"]],
  ],
  editorial: [
    ["Masthead", "54px, 5 sections → 44px, 5 → 32px, 4", ["navbar"]],
    ["Lead story", "520px image, 46px headline → 380px, 36px → 220px, 26px", ["hero"]],
    ["Article index", "3 cards in a row → 2 × 2 → thumbnail-left list rows", ["list", "cards"]],
    WEB_FOOTER,
  ],
  docs: [
    ["Layout", "tree, article, on-this-page → tree and article → article only", ["sidebar", "list"]],
    ["Docs tree", "268px → 220px → behind a menu button", ["sidebar"]],
    ["On this page", "right-hand rail → hidden → collapsed row under the title", ["tabs"]],
  ],
  agency: [
    ["Navigation", "4 links over the hero → 4 links → menu button", ["navbar"]],
    ["Hero", "880px tall, 108px headline → 720px, 72px → 600px, 46px; CTA row → row → stacked", ["hero"]],
    ["Services", "38px names → 30px → 22px", ["list"]],
    ["Case studies", "2 columns → 2 → 1", ["cards"]],
  ],
  "mobile-finance": [
    APP_NAV(true),
    ["Balance + actions", "balance, actions and revenue chart side by side → balance beside a 2 × 2 action grid → stacked (original)", ["stats", "cards"]],
    ["Transactions", "full table → 7-row list in a card → 5-row list (original)", ["list"]],
    ["Status bar", "none — it's a browser → shown → shown", ["navbar"]],
  ],
  "mobile-feed": [
    APP_NAV(true),
    ["Feed", "one 580px column beside a suggestions rail → 2-column grid → one column (original)", ["cards"]],
    ["Stories", "8 → 11 → 6 (original)", ["list"]],
  ],
  "mobile-onboarding": [
    APP_NAV(false),
    ["Layout", "split screen, art left, copy and actions right → stacked and centred with wide margins → stacked, full bleed (original)", ["hero"]],
    ["Headline", "44px, left aligned → 40px, centred → 30px, centred (original)", ["hero"]],
    ["Primary action", "180px beside the sign-in link → centred, 394px → full width (original)", ["cta"]],
  ],
  "mobile-profile": [
    APP_NAV(true),
    ["Profile header", "avatar beside name, stats and edit button → same, smaller → centred avatar, stats below (original)", ["stats", "navbar"]],
    ["Grid", "5 columns → 4 → 3 (original)", ["cards"]],
  ],
};

export function responsiveRules(item: Item): [string, string][] {
  const rules = RULES[item.archetype];
  const scoped = item.kind === "component" ? rules.filter(([, , b]) => b.includes(item.componentType ?? "")) : rules;
  return (scoped.length ? scoped : rules).map(([k, v]) => [k, v]);
}
