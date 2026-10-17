import { ITEMS } from "@/lib/data";
import { applyFilters, SCOPES, type Filters } from "@/lib/query";
import { GOALS, GUIDE_INDUSTRIES, goalKey, type Goal, type Landing, type Landings } from "./goals";

/*
 * Every answer the guide's welcome can get — goal × industry × right-to-left, 144 of them — mapped
 * to where it lands. Worked out here so the browser gets this table instead of the catalogue.
 */

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
function land(g: Goal): Landing {
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

export const LANDINGS: Landings = Object.fromEntries(
  GOALS.flatMap(({ id }) =>
    [undefined, ...GUIDE_INDUSTRIES].flatMap((industry) => [false, true].map((rtl) => ({ id, industry, rtl }) as Goal)),
  ).map((g) => [goalKey(g), land(g)]),
);
