import { ITEMS } from "@/lib/data";
import { applyFilters, filtersFromParams, type Filters } from "@/lib/query";
import { SORTS } from "@/lib/taxonomy";
import { Feed } from "./Feed";
import { FilterBar, type FilterDef } from "./FilterBar";
import { PageHeader, Shell, StickyBar } from "./Section";

export function FeedPage({
  title,
  sub,
  base,
  defs,
  params,
}: {
  title: string;
  sub?: string;
  base: Filters;
  defs: FilterDef[];
  params: Record<string, string | string[] | undefined>;
}) {
  const url = filtersFromParams(params);
  const merged: Filters = { ...base };
  for (const [k, v] of Object.entries(url)) {
    if (v) (merged as Record<string, string>)[k] = v;
  }
  const items = applyFilters(ITEMS, merged);

  return (
    <>
      <Shell>
        <PageHeader
          title={title}
          sub={sub}
          right={<span className="text-[13px] text-text-3 tabular-nums">{items.length} results</span>}
        />
      </Shell>
      <div className="h-3" />
      <StickyBar>
        <FilterBar defs={defs} sorts={SORTS} />
      </StickyBar>
      <Shell>
        <div className="pt-4">
          <Feed items={items} />
        </div>
      </Shell>
    </>
  );
}

/** Facet segments (/web/saas/dark) resolve against the taxonomy into filters. */
export function facetToFilters(
  segments: string[] | undefined,
  dicts: { param: keyof Filters; list: readonly { slug: string }[] }[],
): Filters {
  const f: Filters = {};
  for (const seg of segments ?? []) {
    for (const d of dicts) {
      if (!f[d.param] && d.list.some((t) => t.slug === seg)) {
        (f as Record<string, string>)[d.param as string] = seg;
        break;
      }
    }
  }
  return f;
}
