export const CATEGORIES = [
  { slug: "landing-page", name: "Landing page" },
  { slug: "saas", name: "SaaS" },
  { slug: "dashboard", name: "Dashboard" },
  { slug: "ecommerce", name: "E-commerce" },
  { slug: "portfolio", name: "Portfolio" },
  { slug: "agency", name: "Agency" },
  { slug: "marketplace", name: "Marketplace" },
  { slug: "blog", name: "Blog" },
  { slug: "docs", name: "Docs" },
  { slug: "pricing", name: "Pricing" },
  { slug: "checkout", name: "Checkout" },
  { slug: "auth", name: "Login" },
  { slug: "onboarding", name: "Onboarding" },
  { slug: "feed", name: "Feed" },
] as const;

export const INDUSTRIES = [
  { slug: "fintech", name: "Fintech" },
  { slug: "saas", name: "SaaS" },
  { slug: "ai", name: "AI" },
  { slug: "healthcare", name: "Healthcare" },
  { slug: "ecommerce", name: "E-commerce" },
  { slug: "education", name: "Education" },
  { slug: "real-estate", name: "Real estate" },
  { slug: "travel", name: "Travel" },
  { slug: "fashion", name: "Fashion" },
  { slug: "food", name: "Food" },
  { slug: "productivity", name: "Productivity" },
  { slug: "crypto", name: "Crypto" },
] as const;

export const STYLES = [
  { slug: "minimal", name: "Minimal" },
  { slug: "dark", name: "Dark" },
  { slug: "light", name: "Light" },
  { slug: "editorial", name: "Editorial" },
  { slug: "brutalist", name: "Brutalist" },
  { slug: "luxury", name: "Luxury" },
  { slug: "corporate", name: "Corporate" },
  { slug: "playful", name: "Playful" },
  { slug: "futuristic", name: "Futuristic" },
  { slug: "glassmorphism", name: "Glassmorphism" },
  { slug: "retro", name: "Retro" },
] as const;

export const TECHNOLOGIES = [
  { slug: "react", name: "React" },
  { slug: "nextjs", name: "Next.js" },
  { slug: "tailwind", name: "Tailwind" },
  { slug: "vue", name: "Vue" },
  { slug: "svelte", name: "Svelte" },
  { slug: "webflow", name: "Webflow" },
  { slug: "framer", name: "Framer" },
  { slug: "shopify", name: "Shopify" },
  { slug: "swiftui", name: "SwiftUI" },
  { slug: "flutter", name: "Flutter" },
] as const;

export const COMPONENT_TYPES = [
  { slug: "navbar", name: "Navbar", group: "Navigation" },
  { slug: "sidebar", name: "Sidebar", group: "Navigation" },
  { slug: "tabs", name: "Tabs", group: "Navigation" },
  { slug: "breadcrumb", name: "Breadcrumb", group: "Navigation" },
  { slug: "cards", name: "Cards", group: "Content" },
  { slug: "table", name: "Table", group: "Content" },
  { slug: "stats", name: "Stats", group: "Content" },
  { slug: "charts", name: "Charts", group: "Content" },
  { slug: "list", name: "List", group: "Content" },
  { slug: "hero", name: "Hero", group: "Marketing" },
  { slug: "pricing", name: "Pricing", group: "Marketing" },
  { slug: "testimonials", name: "Testimonials", group: "Marketing" },
  { slug: "logo-cloud", name: "Logo cloud", group: "Marketing" },
  { slug: "cta", name: "CTA", group: "Marketing" },
  { slug: "faq", name: "FAQ", group: "Marketing" },
  { slug: "footer", name: "Footer", group: "Marketing" },
  { slug: "login", name: "Login", group: "Forms" },
  { slug: "signup", name: "Signup", group: "Forms" },
  { slug: "checkout", name: "Checkout", group: "Forms" },
  { slug: "search", name: "Search", group: "Forms" },
  { slug: "filters", name: "Filters", group: "Forms" },
  { slug: "inputs", name: "Inputs", group: "Forms" },
  { slug: "modal", name: "Modal", group: "Interaction" },
  { slug: "dropdown", name: "Dropdown", group: "Interaction" },
  { slug: "notification", name: "Notification", group: "Interaction" },
  { slug: "accordion", name: "Accordion", group: "Interaction" },
  { slug: "empty-state", name: "Empty state", group: "Interaction" },
] as const;

export const PLATFORMS = [
  { slug: "web", name: "Web" },
  { slug: "ios", name: "iOS" },
  { slug: "android", name: "Android" },
  { slug: "ipad", name: "iPad" },
] as const;

export const APP_CATEGORIES = [
  "Finance",
  "Productivity",
  "Social",
  "Health",
  "Shopping",
  "Travel",
  "Education",
  "Media",
] as const;

export const SORTS = [
  { slug: "trending", name: "Trending" },
  { slug: "new", name: "Newest" },
  { slug: "saved", name: "Most saved" },
  { slug: "views", name: "Most viewed" },
] as const;

export const name = (list: readonly { slug: string; name: string }[], slug?: string) =>
  list.find((t) => t.slug === slug)?.name ?? slug ?? "";

export const componentGroups = () => {
  const groups = new Map<string, { slug: string; name: string }[]>();
  for (const c of COMPONENT_TYPES) {
    if (!groups.has(c.group)) groups.set(c.group, []);
    groups.get(c.group)!.push({ slug: c.slug, name: c.name });
  }
  return [...groups.entries()];
};
