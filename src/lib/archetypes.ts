/**
 * The procedural preview layouts — split from data.ts so the browser (MockScreen) can have the
 * geometry without the catalogue that data.ts builds.
 */

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

/* heading and columns are only known for real captures */
export type Block = { type: string; label: string; heading?: string; columns?: number };

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
