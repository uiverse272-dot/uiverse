import { paletteByKey, type Palette } from "./palettes";

export type Archetype =
  | "saas-landing"
  | "dashboard"
  | "pricing"
  | "ecommerce"
  | "portfolio"
  | "checkout"
  | "auth"
  | "editorial"
  | "docs"
  | "agency"
  | "mobile-finance"
  | "mobile-feed"
  | "mobile-onboarding"
  | "mobile-profile";

export type Kind = "screen" | "component" | "layout" | "palette";

export type Block = { type: string; label: string };

export type Source = {
  slug: string;
  name: string;
  domain: string;
  industry: string;
  style: string;
  tech: string[];
  palette: string;
  tagline: string;
  about: string;
};

export type Item = {
  id: string;
  slug: string;
  kind: Kind;
  title: string;
  archetype: Archetype;
  source: Source;
  palette: Palette;
  aspect: number;
  category: string;
  industry: string;
  style: string;
  platform: string;
  device: "desktop" | "tablet" | "mobile";
  tech: string[];
  componentType?: string;
  parentSlug?: string;
  crop?: { y: number; h: number };
  blocks: Block[];
  hasCode: boolean;
  tier: "free" | "premium";
  responsive: boolean;
  has3d: boolean;
  saves: number;
  views: number;
  daysAgo: number;
  colors: string[];
};

/* ------------------------------------------------------------------ */
/* Archetype definitions: geometry + section structure                 */
/* ------------------------------------------------------------------ */

export const ARCHETYPES: Record<
  Archetype,
  { w: number; h: number; category: string; device: "desktop" | "mobile"; blocks: Block[] }
> = {
  "saas-landing": {
    w: 1440, h: 3080, category: "landing-page", device: "desktop",
    blocks: [
      { type: "navbar", label: "Navbar" },
      { type: "hero", label: "Hero" },
      { type: "logo-cloud", label: "Logo cloud" },
      { type: "cards", label: "Feature grid" },
      { type: "stats", label: "Metrics band" },
      { type: "testimonials", label: "Testimonial" },
      { type: "cta", label: "CTA" },
      { type: "footer", label: "Footer" },
    ],
  },
  dashboard: {
    w: 1440, h: 960, category: "dashboard", device: "desktop",
    blocks: [
      { type: "sidebar", label: "Sidebar" },
      { type: "navbar", label: "Top bar" },
      { type: "stats", label: "Stat cards" },
      { type: "charts", label: "Chart panel" },
      { type: "list", label: "Activity list" },
      { type: "table", label: "Data table" },
    ],
  },
  pricing: {
    w: 1440, h: 1360, category: "pricing", device: "desktop",
    blocks: [
      { type: "navbar", label: "Navbar" },
      { type: "hero", label: "Section header" },
      { type: "tabs", label: "Billing toggle" },
      { type: "pricing", label: "Pricing tiers" },
      { type: "faq", label: "FAQ" },
      { type: "footer", label: "Footer" },
    ],
  },
  ecommerce: {
    w: 1440, h: 2120, category: "ecommerce", device: "desktop",
    blocks: [
      { type: "navbar", label: "Navbar + search" },
      { type: "hero", label: "Campaign hero" },
      { type: "filters", label: "Category row" },
      { type: "cards", label: "Product grid" },
      { type: "cta", label: "Editorial band" },
      { type: "footer", label: "Footer" },
    ],
  },
  portfolio: {
    w: 1440, h: 2110, category: "portfolio", device: "desktop",
    blocks: [
      { type: "navbar", label: "Minimal nav" },
      { type: "hero", label: "Type statement" },
      { type: "cards", label: "Work grid" },
      { type: "list", label: "Index list" },
      { type: "footer", label: "Contact footer" },
    ],
  },
  checkout: {
    w: 1440, h: 900, category: "checkout", device: "desktop",
    blocks: [
      { type: "navbar", label: "Slim header" },
      { type: "inputs", label: "Contact fields" },
      { type: "checkout", label: "Payment form" },
      { type: "list", label: "Order summary" },
      { type: "cta", label: "Pay button" },
    ],
  },
  auth: {
    w: 1440, h: 900, category: "auth", device: "desktop",
    blocks: [
      { type: "login", label: "Sign-in card" },
      { type: "inputs", label: "Field group" },
      { type: "cta", label: "Provider buttons" },
    ],
  },
  editorial: {
    w: 1440, h: 1650, category: "blog", device: "desktop",
    blocks: [
      { type: "navbar", label: "Masthead" },
      { type: "hero", label: "Lead story" },
      { type: "list", label: "Article index" },
      { type: "cards", label: "Related grid" },
      { type: "footer", label: "Footer" },
    ],
  },
  docs: {
    w: 1440, h: 1020, category: "docs", device: "desktop",
    blocks: [
      { type: "sidebar", label: "Docs tree" },
      { type: "breadcrumb", label: "Breadcrumb" },
      { type: "list", label: "Prose + code" },
      { type: "tabs", label: "On this page" },
    ],
  },
  agency: {
    w: 1440, h: 2830, category: "agency", device: "desktop",
    blocks: [
      { type: "navbar", label: "Overlay nav" },
      { type: "hero", label: "Full-bleed hero" },
      { type: "list", label: "Services list" },
      { type: "cards", label: "Case studies" },
      { type: "cta", label: "Contact band" },
    ],
  },
  "mobile-finance": {
    w: 390, h: 844, category: "dashboard", device: "mobile",
    blocks: [
      { type: "navbar", label: "Header" },
      { type: "stats", label: "Balance card" },
      { type: "cards", label: "Quick actions" },
      { type: "list", label: "Transactions" },
      { type: "tabs", label: "Tab bar" },
    ],
  },
  "mobile-feed": {
    w: 390, h: 844, category: "feed", device: "mobile",
    blocks: [
      { type: "navbar", label: "Header" },
      { type: "list", label: "Story rail" },
      { type: "cards", label: "Feed cards" },
      { type: "tabs", label: "Tab bar" },
    ],
  },
  "mobile-onboarding": {
    w: 390, h: 844, category: "onboarding", device: "mobile",
    blocks: [
      { type: "hero", label: "Illustration" },
      { type: "hero", label: "Headline" },
      { type: "tabs", label: "Progress dots" },
      { type: "cta", label: "Primary action" },
    ],
  },
  "mobile-profile": {
    w: 390, h: 844, category: "feed", device: "mobile",
    blocks: [
      { type: "navbar", label: "Header" },
      { type: "stats", label: "Profile stats" },
      { type: "tabs", label: "Segmented control" },
      { type: "cards", label: "Grid" },
      { type: "tabs", label: "Tab bar" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Sources — invented products, so nothing impersonates a real brand   */
/* ------------------------------------------------------------------ */

const S = (
  slug: string, name: string, domain: string, industry: string, style: string,
  tech: string[], palette: string, tagline: string, about: string,
): Source => ({ slug, name, domain, industry, style, tech, palette, tagline, about });

export const SOURCES: Source[] = [
  S("ledgerly", "Ledgerly", "ledgerly.com", "fintech", "dark", ["react", "nextjs", "tailwind"], "ledger", "Money that explains itself", "Business banking and spend management for operators."),
  S("northwind", "Northwind", "northwind.io", "saas", "minimal", ["nextjs", "tailwind"], "paper", "Ship the boring parts faster", "Infrastructure tooling for product teams."),
  S("halo-health", "Halo Health", "halohealth.co", "healthcare", "light", ["react", "tailwind"], "mint", "Care, coordinated", "Patient coordination for specialist clinics."),
  S("substrate", "Substrate", "substrate.ai", "ai", "futuristic", ["nextjs", "react"], "violet", "Models that stay in your VPC", "Private model hosting and evaluation."),
  S("cormorant", "Cormorant", "cormorant.studio", "fashion", "luxury", ["webflow"], "noir", "Made slowly, worn forever", "A small-batch atelier in Lisbon."),
  S("quarry", "Quarry", "quarry.dev", "productivity", "dark", ["react", "tailwind"], "carbon", "Your team's second brain", "Docs, tasks and decisions in one place."),
  S("meridian", "Meridian", "meridian.travel", "travel", "editorial", ["nextjs"], "sand", "Go further, slower", "Guided long-form journeys."),
  S("basil", "Basil", "basil.kitchen", "food", "playful", ["shopify"], "citrus", "Dinner, sorted", "Weekly meal kits from local farms."),
  S("atlas-ed", "Atlas Ed", "atlased.org", "education", "corporate", ["vue", "tailwind"], "porcelain", "Learning that adapts", "Adaptive coursework for secondary schools."),
  S("tidal", "Tidal", "tidal.finance", "crypto", "futuristic", ["react", "nextjs"], "ocean", "Liquidity without custody", "Non-custodial trading infrastructure."),
  S("plotline", "Plotline", "plotline.so", "saas", "minimal", ["svelte", "tailwind"], "concrete", "Analytics you'll actually read", "Product analytics for small teams."),
  S("rook-estate", "Rook", "rook.estate", "real-estate", "editorial", ["framer"], "forest", "Homes with a history", "Period property sales and lettings."),
  S("vellum", "Vellum", "vellum.press", "saas", "editorial", ["nextjs"], "paper", "Writing, published properly", "A publishing platform for long-form writers."),
  S("current", "Current", "current.app", "fintech", "dark", ["swiftui"], "electric", "Spend with intent", "Personal finance for people who hate budgets."),
  S("orchid", "Orchid", "orchid.care", "healthcare", "minimal", ["flutter"], "rose", "Therapy that fits your week", "Matching and scheduling for talk therapy."),
  S("kiln", "Kiln", "kiln.build", "saas", "brutalist", ["react", "tailwind"], "concrete", "Build logs, not dashboards", "CI and deployment for monorepos."),
  S("saffron", "Saffron", "saffron.market", "ecommerce", "playful", ["shopify"], "citrus", "Spices with provenance", "Direct-trade spice merchant."),
  S("lantern", "Lantern", "lantern.school", "education", "light", ["nextjs", "tailwind"], "cloud", "One lesson at a time", "Micro-courses for working adults."),
  S("pike", "Pike", "pike.fitness", "healthcare", "dark", ["swiftui"], "ink", "Train by feel", "Strength training without the spreadsheet."),
  S("gravel", "Gravel", "gravel.cc", "travel", "brutalist", ["webflow"], "concrete", "Roads less paved", "Bikepacking routes and gear."),
  S("umbra", "Umbra", "umbra.design", "productivity", "dark", ["nextjs", "react"], "carbon", "Design systems, versioned", "Token management for design teams."),
  S("clearing", "Clearing", "clearing.legal", "saas", "corporate", ["react"], "porcelain", "Contracts without the chase", "Contract lifecycle for in-house teams."),
  S("bramble", "Bramble", "bramble.garden", "ecommerce", "light", ["shopify"], "forest", "Grow something", "Seeds, tools and advice."),
  S("signal-post", "Signal Post", "signalpost.news", "saas", "editorial", ["nextjs"], "paper", "The week, condensed", "Independent technology journalism."),
  S("nimbus", "Nimbus", "nimbus.cloud", "saas", "glassmorphism", ["react", "tailwind"], "cloud", "Compute that scales down", "Serverless infrastructure with real pricing."),
  S("terrace", "Terrace", "terrace.hotel", "travel", "luxury", ["framer"], "noir", "Stay a little longer", "A collection of six small hotels."),
];

/* ------------------------------------------------------------------ */
/* Screen plan                                                         */
/* ------------------------------------------------------------------ */

type Plan = [sourceSlug: string, archetype: Archetype, title: string];

const PLAN: Plan[] = [
  ["ledgerly", "saas-landing", "Homepage"],
  ["ledgerly", "dashboard", "Spend overview"],
  ["ledgerly", "pricing", "Pricing"],
  ["ledgerly", "auth", "Sign in"],
  ["northwind", "saas-landing", "Homepage"],
  ["northwind", "docs", "Documentation"],
  ["northwind", "pricing", "Plans"],
  ["halo-health", "saas-landing", "Homepage"],
  ["halo-health", "dashboard", "Care schedule"],
  ["substrate", "saas-landing", "Homepage"],
  ["substrate", "dashboard", "Model evaluations"],
  ["substrate", "docs", "API reference"],
  ["cormorant", "ecommerce", "Shop all"],
  ["cormorant", "portfolio", "Lookbook"],
  ["cormorant", "checkout", "Checkout"],
  ["quarry", "saas-landing", "Homepage"],
  ["quarry", "dashboard", "Workspace"],
  ["quarry", "mobile-feed", "Inbox"],
  ["meridian", "editorial", "Journal"],
  ["meridian", "agency", "Expeditions"],
  ["basil", "ecommerce", "Weekly menu"],
  ["basil", "mobile-onboarding", "Welcome"],
  ["basil", "checkout", "Basket"],
  ["atlas-ed", "saas-landing", "Homepage"],
  ["atlas-ed", "dashboard", "Class insights"],
  ["tidal", "saas-landing", "Homepage"],
  ["tidal", "dashboard", "Trading desk"],
  ["tidal", "mobile-finance", "Portfolio"],
  ["plotline", "saas-landing", "Homepage"],
  ["plotline", "dashboard", "Funnels"],
  ["plotline", "pricing", "Pricing"],
  ["rook-estate", "editorial", "Listings journal"],
  ["rook-estate", "portfolio", "Featured homes"],
  ["vellum", "editorial", "Reading view"],
  ["vellum", "saas-landing", "Homepage"],
  ["current", "mobile-finance", "Accounts"],
  ["current", "mobile-onboarding", "Get started"],
  ["current", "mobile-profile", "Profile"],
  ["orchid", "mobile-onboarding", "Matching"],
  ["orchid", "saas-landing", "Homepage"],
  ["kiln", "dashboard", "Build log"],
  ["kiln", "saas-landing", "Homepage"],
  ["kiln", "docs", "CLI reference"],
  ["saffron", "ecommerce", "Storefront"],
  ["saffron", "checkout", "Checkout"],
  ["lantern", "saas-landing", "Homepage"],
  ["lantern", "mobile-feed", "Today"],
  ["lantern", "pricing", "Membership"],
  ["pike", "mobile-finance", "Training week"],
  ["pike", "mobile-profile", "Athlete"],
  ["gravel", "agency", "Routes"],
  ["gravel", "ecommerce", "Gear"],
  ["umbra", "dashboard", "Token library"],
  ["umbra", "saas-landing", "Homepage"],
  ["umbra", "docs", "Guidelines"],
  ["clearing", "saas-landing", "Homepage"],
  ["clearing", "dashboard", "Contract queue"],
  ["clearing", "auth", "Log in"],
  ["bramble", "ecommerce", "Seed shop"],
  ["bramble", "editorial", "Grow guides"],
  ["signal-post", "editorial", "Front page"],
  ["signal-post", "auth", "Subscribe"],
  ["nimbus", "saas-landing", "Homepage"],
  ["nimbus", "pricing", "Pricing"],
  ["nimbus", "dashboard", "Usage"],
  ["terrace", "agency", "The hotels"],
  ["terrace", "portfolio", "Rooms"],
  ["terrace", "checkout", "Reserve"],
];

/* deterministic pseudo-random, so server and client always agree */
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rnd(seed: string, min: number, max: number) {
  let t = hash(seed) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return Math.floor(min + r * (max - min));
}

const sourceOf = (slug: string) => SOURCES.find((s) => s.slug === slug)!;

/* Which blocks are worth promoting into standalone component entries */
const CROPPABLE = new Set([
  "hero", "pricing", "navbar", "table", "stats", "testimonials",
  "cta", "footer", "login", "checkout", "cards", "sidebar", "charts", "filters", "list",
]);

function buildItems(): Item[] {
  const items: Item[] = [];

  PLAN.forEach(([srcSlug, archetype, title], i) => {
    const src = sourceOf(srcSlug);
    const arch = ARCHETYPES[archetype];
    const pal = paletteByKey(src.palette);
    const id = `s${String(i + 1).padStart(3, "0")}`;
    const slug = `${id}-${srcSlug}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const mobile = arch.device === "mobile";

    const screen: Item = {
      id,
      slug,
      kind: "screen",
      title,
      archetype,
      source: src,
      palette: pal,
      aspect: arch.w / arch.h,
      category: arch.category,
      industry: src.industry,
      style: pal.dark ? "dark" : src.style === "dark" ? "minimal" : src.style,
      platform: mobile ? (i % 3 === 0 ? "android" : "ios") : "web",
      device: mobile ? "mobile" : "desktop",
      tech: src.tech,
      blocks: arch.blocks,
      hasCode: i % 5 === 0,
      tier: i % 7 === 0 ? "premium" : "free",
      responsive: !mobile,
      has3d: ["substrate", "tidal", "nimbus", "umbra"].includes(srcSlug) && archetype === "saas-landing",
      saves: rnd(slug + "sv", 40, 4200),
      views: rnd(slug + "vw", 900, 92000),
      daysAgo: rnd(slug + "dt", 1, 240),
      colors: [pal.bg, pal.surface, pal.accent, pal.text, pal.muted],
    };
    items.push(screen);

    // derive component entries from this screen's blocks
    let cIndex = 0;
    arch.blocks.forEach((b, bi) => {
      if (!CROPPABLE.has(b.type)) return;
      if ((i + bi) % 3 !== 0) return; // keep the set from exploding
      cIndex++;
      const cid = `c${id.slice(1)}${cIndex}`;
      const cslug = `${cid}-${srcSlug}-${b.type}`;
      const y = bi / arch.blocks.length;
      const h = 1 / arch.blocks.length;
      items.push({
        ...screen,
        id: cid,
        slug: cslug,
        kind: "component",
        title: `${b.label}`,
        componentType: b.type,
        parentSlug: slug,
        crop: { y, h },
        aspect: mobile ? 0.9 : b.type === "footer" || b.type === "navbar" ? 3.2 : 1.55,
        blocks: [b],
        hasCode: (i + bi) % 3 === 0,
        saves: rnd(cslug + "sv", 20, 2600),
        views: rnd(cslug + "vw", 400, 40000),
        daysAgo: rnd(cslug + "dt", 1, 240),
      });
    });
  });

  return items;
}

export const ITEMS: Item[] = buildItems();

export const bySlug = (slug: string) => ITEMS.find((i) => i.slug === slug);
export const screens = () => ITEMS.filter((i) => i.kind === "screen");
export const components = () => ITEMS.filter((i) => i.kind === "component");

export const LAYOUTS = Array.from(
  new Map(
    screens()
      .filter((s) => s.device === "desktop")
      .map((s) => [s.archetype, s]),
  ).values(),
).map((s) => ({
  slug: `l-${s.archetype}`,
  name:
    s.archetype
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  sections: s.blocks,
  example: s,
  uses: rnd(s.archetype + "use", 8, 340),
}));

export const PALETTE_ITEMS = Array.from(
  new Map(screens().map((s) => [s.palette.key, s])).values(),
).map((s) => ({
  slug: `p-${s.palette.key}`,
  palette: s.palette,
  source: s.source,
  example: s,
  saves: rnd(s.palette.key + "sv", 60, 1800),
}));

export const CREATORS = SOURCES.map((s, i) => ({
  handle: s.slug,
  name: s.name,
  role: i % 3 === 0 ? "Studio" : i % 3 === 1 ? "Product designer" : "Design engineer",
  source: s,
  screens: screens().filter((x) => x.source.slug === s.slug).length,
  followers: rnd(s.slug + "fl", 120, 24000),
  available: i % 4 === 0,
}));

export function timeAgo(days: number) {
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function compact(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
