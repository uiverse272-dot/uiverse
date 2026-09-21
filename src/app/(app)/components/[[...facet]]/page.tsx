import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { COMPONENT_TYPES, INDUSTRIES, STYLES, TECHNOLOGIES, name } from "@/lib/taxonomy";

export default async function ComponentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ facet?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { facet } = await params;
  const sp = await searchParams;
  const fromPath = facetToFilters(facet, [
    { param: "componentType", list: COMPONENT_TYPES },
    { param: "style", list: STYLES },
    { param: "tech", list: TECHNOLOGIES },
  ]);
  const label = name(COMPONENT_TYPES, fromPath.componentType);

  return (
    <FeedPage
      title={label ? `${label} components` : "Components"}
      sub="Every component here is a crop of a real screen, so you can always see where it came from and how it was used."
      base={{ kind: "component", ...fromPath }}
      params={sp}
      defs={[
        { param: "component", label: "Component", options: COMPONENT_TYPES },
        { param: "industry", label: "Industry", options: INDUSTRIES },
        { param: "style", label: "Style", options: STYLES },
        { param: "tech", label: "Framework", options: TECHNOLOGIES },
      ]}
    />
  );
}
