import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ITEMS } from "@/lib/data";
import { applyFilters, filterKey, filtersFromParams, paramFilter, SCOPES, type Filters } from "@/lib/query";
import { localTerms, name, SORTS, type Term } from "@/lib/taxonomy";
import type { Dict } from "@/i18n/dict";
import { fill, plural } from "@/i18n/format";
import { alternates, getI18n } from "@/i18n/server";
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
  const { lang, t } = await getI18n();

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
      return { ...d, options: localTerms(options, lang) };
    })
    .filter((d) => d.options.length > 0);

  return (
    <>
      <Shell>
        <PageHeader
          title={title}
          sub={sub}
          right={<span className="text-[13px] text-text-3 tabular-nums">{plural(t.common.results, items.length, lang)}</span>}
        />
      </Shell>
      <div className="h-3" />
      <StickyBar>
        <FilterBar defs={facets} sorts={localTerms(SORTS, lang)} />
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

type Facet = { param: keyof Filters; list: readonly Term[]; /** names the page when it's in the path */ titled?: boolean };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * A browse route — /web, /apps, /components — with optional facet segments. Returns the page and
 * its metadata, so each route file is just its facets and filters.
 */
export function facetRoute(scope: "web" | "apps" | "components", facets: Facet[], defs: (t: Dict) => FilterDef[]) {
  type Params = Promise<{ facet?: string[] }>;

  async function resolve(params: Params) {
    const { facet } = await params;
    const { lang, t } = await getI18n();
    const fromPath = facetToFilters(facet, facets);
    if (!fromPath) notFound();
    const label = facets
      .filter((f) => f.titled !== false)
      .map((f) => name(f.list, fromPath[f.param] as string | undefined, lang))
      .find(Boolean);
    const feed = t.feeds[scope];
    const path = [SCOPES[scope].path, ...(facet ?? [])].join("/");
    return { fromPath, lang, t, path, title: label ? fill(feed.titleWith, { label }) : feed.title };
  }

  return {
    async generateMetadata({ params }: { params: Params }): Promise<Metadata> {
      const { title, lang, path } = await resolve(params);
      return { title, alternates: alternates(lang, path) };
    },
    async Page({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
      const { fromPath, title, t } = await resolve(params);
      return (
        <FeedPage
          title={title}
          sub={t.feeds[scope].sub}
          base={{ ...SCOPES[scope].base, ...fromPath }}
          params={await searchParams}
          defs={defs(t)}
        />
      );
    },
  };
}
