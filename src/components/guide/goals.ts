import type { Lang } from "@/i18n/config";
import type { Dict } from "@/i18n/dict";
import { fill, lower } from "@/i18n/format";
import { SCOPES, type Scope } from "@/lib/filters";

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

/** Where a goal lands and how much is there — worked out on the server (guide/landings.ts) */
export type Landing = { href: string; count: number; relaxed: ("industry" | "dir")[] };
export type Landings = Record<string, Landing>;
export const goalKey = (g: Goal) => `${g.id}|${g.industry ?? ""}|${g.rtl ? "rtl" : ""}`;

export function landing(g: Goal, landings: Landings): Landing {
  const def = GOALS.find((x) => x.id === g.id) ?? GOALS[0];
  return landings[goalKey(g)] ?? { href: SCOPES[def.scope].path, count: 0, relaxed: [] };
}

export function describe(g: Goal, t: Dict["guide"], lang: Lang) {
  const label = (t.goals[g.id] ?? t.goals.landing)[0];
  const ind = g.industry ? t.industries[g.industry] : undefined;
  return [lower(label, lang), ind ? fill(t.forIndustry, { industry: ind }) : null, g.rtl ? t.rtlTag : null]
    .filter(Boolean)
    .join(" ");
}
