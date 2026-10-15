import type { Lang } from "@/i18n/config";
import type { Dict } from "@/i18n/dict";
import { fill } from "@/i18n/format";
import { ITEMS } from "@/lib/data";
import { applyFilters, SCOPES, type Filters, type Scope } from "@/lib/query";

/** What someone can say they're building — each one is a feed they can land in. Labels: dict guide.goals */
export const GOALS: { id: string; scope: Scope; category?: string }[] = [
  { id: "landing", scope: "web", category: "landing-page" },
  { id: "pricing", scope: "web", category: "pricing" },
  { id: "dashboard", scope: "web", category: "dashboard" },
  { id: "store", scope: "web", category: "ecommerce" },
  { id: "checkout", scope: "web", category: "checkout" },
  { id: "auth", scope: "web", category: "auth" },
  { id: "mobile", scope: "apps" },
  { id: "component", scope: "components" },
];

/** Labels: dict guide.industries */
export const GUIDE_INDUSTRIES = ["fintech", "saas", "ecommerce", "food", "healthcare", "education", "travel", "ai"] as const;

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

export function describe(g: Goal, t: Dict["guide"], lang: Lang) {
  const label = (t.goals[g.id] ?? t.goals.landing)[0];
  const ind = g.industry ? t.industries[g.industry] : undefined;
  return [lang === "ar" ? label : label.toLowerCase(), ind ? fill(t.forIndustry, { industry: ind }) : null, g.rtl ? t.rtlTag : null]
    .filter(Boolean)
    .join(" ");
}
