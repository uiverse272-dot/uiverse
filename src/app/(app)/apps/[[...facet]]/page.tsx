import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { CATEGORIES, INDUSTRIES, PLATFORMS, STYLES, name } from "@/lib/taxonomy";

export default async function AppsPage({
  params,
  searchParams,
}: {
  params: Promise<{ facet?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { facet } = await params;
  const sp = await searchParams;
  const fromPath = facetToFilters(facet, [
    { param: "platform", list: PLATFORMS },
    { param: "industry", list: INDUSTRIES },
    { param: "category", list: CATEGORIES },
  ]);
  const label = name(PLATFORMS, fromPath.platform) || name(INDUSTRIES, fromPath.industry);

  return (
    <FeedPage
      title={label ? `${label} apps` : "Mobile & app UI"}
      sub="Screens from shipped mobile products. Flows — ordered runs of screens — arrive in Phase 2."
      base={{ device: "mobile", kind: "screen", ...fromPath }}
      params={sp}
      defs={[
        { param: "platform", label: "Platform", options: PLATFORMS },
        { param: "category", label: "Screen", options: CATEGORIES },
        { param: "industry", label: "Category", options: INDUSTRIES },
        { param: "style", label: "Style", options: STYLES },
      ]}
    />
  );
}
