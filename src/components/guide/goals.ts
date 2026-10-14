import { ITEMS } from "@/lib/data";
import { applyFilters, SCOPES, type Filters, type Scope } from "@/lib/query";

/** What someone can say they're building — each one is a feed they can land in. */
export const GOALS: { id: string; label: string; hint: string; scope: Scope; category?: string }[] = [
  { id: "landing", label: "Landing page", hint: "Homepages, product pages", scope: "web", category: "landing-page" },
  { id: "pricing", label: "Pricing page", hint: "Tiers, plans, comparisons", scope: "web", category: "pricing" },
  { id: "dashboard", label: "Dashboard", hint: "Apps, admin, analytics", scope: "web", category: "dashboard" },
  { id: "store", label: "Online store", hint: "Shop, product grid", scope: "web", category: "ecommerce" },
  { id: "checkout", label: "Checkout", hint: "Cart, payment, order", scope: "web", category: "checkout" },
  { id: "auth", label: "Sign-in / sign-up", hint: "Login, onboarding forms", scope: "web", category: "auth" },
  { id: "mobile", label: "Mobile app", hint: "iOS and Android screens", scope: "apps" },
  { id: "component", label: "One component", hint: "Hero, navbar, pricing table…", scope: "components" },
];

export const GUIDE_INDUSTRIES = [
  ["fintech", "Fintech"], ["saas", "SaaS"], ["ecommerce", "E-commerce"], ["food", "Food"],
  ["healthcare", "Health"], ["education", "Education"], ["travel", "Travel"], ["ai", "AI"],
] as const;

export type Goal = { id: string; industry?: string; rtl: boolean };

function filtersFor(g: Goal, drop: ("industry" | "dir")[] = []): Filters {
  const def = GOALS.find((x) => x.id === g.id) ?? GOALS[0];
  return {
    ...SCOPES[def.scope].base,
    category: def.category,
    industry: drop.includes("industry") ? undefined : g.industry,
    dir: drop.includes("dir") || !g.rtl ? undefined : "rtl",
  };
}

/**
 * Where a goal lands, and how many results are there. If the exact combination is empty it
 * relaxes industry first, then direction — a guide must never open on an empty page.
 */
export function landing(g: Goal) {
  const def = GOALS.find((x) => x.id === g.id) ?? GOALS[0];
  for (const drop of [[], ["industry"], ["industry", "dir"]] as ("industry" | "dir")[][]) {
    const f = filtersFor(g, drop);
    const count = applyFilters(ITEMS, f).length;
    if (count > 0 || drop.length === 2) {
      const params = new URLSearchParams();
      if (def.category) params.set("category", def.category);
      if (f.industry) params.set("industry", f.industry);
      if (f.dir) params.set("dir", f.dir);
      const qs = params.toString();
      return { href: `${SCOPES[def.scope].path}${qs ? `?${qs}` : ""}`, count, relaxed: drop };
    }
  }
  return { href: SCOPES[def.scope].path, count: 0, relaxed: [] };
}

export function describe(g: Goal) {
  const def = GOALS.find((x) => x.id === g.id) ?? GOALS[0];
  const ind = GUIDE_INDUSTRIES.find(([s]) => s === g.industry)?.[1];
  return [def.label.toLowerCase(), ind ? `for ${ind}` : null, g.rtl ? "· Arabic / RTL" : null].filter(Boolean).join(" ");
}
