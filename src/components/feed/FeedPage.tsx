import { ITEMS } from "@/lib/data";
import { applyFilters, filterKey, filtersFromParams, paramFilter, type Filters } from "@/lib/query";
import { SORTS } from "@/lib/taxonomy";
import { Feed } from "./Feed";
import { ssrColumns } from "./ssrColumns";
import { FilterBar, type FilterDef } from "./FilterBar";
import { PageHeader, Shell, StickyBar } from "./Section";

export async function FeedPage({
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
  const ssrCols = await ssrColumns();

  /*
   * Faceted options: each filter lists only the values that return something alongside the
   * other active filters (plus whatever is selected, so it can be cleared). A feed never offers
   * a choice that leads to an empty page.
   */
  const facets = defs
    .map((d) => {
      const key = filterKey(d.param);
      const others = { ...merged, [key]: undefined };
      const options = d.options.filter(
        (o) => o.slug === url[key] || applyFilters(ITEMS, { ...others, ...paramFilter(d.param, o.slug) }).length > 0,
      );
      return { ...d, options };
    })
    .filter((d) => d.options.length > 0);

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
        <FilterBar defs={facets} sorts={SORTS} />
      </StickyBar>
      <Shell>
        <div className="pt-4">
          <Feed items={items} ssrCols={ssrCols} />
        </div>
      </Shell>
    </>
  );
}

/**
 * Facet segments (/web/saas/dark) resolve against the taxonomy into filters. Null when a segment
 * doesn't resolve, so /web/anything is a 404 rather than the unfiltered feed under a second URL.
 */
export function facetToFilters(
  segments: string[] | undefined,
  dicts: { param: keyof Filters; list: readonly { slug: string }[] }[],
): Filters | null {
  const f: Filters = {};
  for (const seg of segments ?? []) {
    const d = dicts.find((d) => !f[d.param] && d.list.some((t) => t.slug === seg));
    if (!d) return null;
    (f as Record<string, string>)[d.param as string] = seg;
  }
  return f;
}
