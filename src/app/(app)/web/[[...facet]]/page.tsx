import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES, name } from "@/lib/taxonomy";

const DEVICES = [
  { slug: "desktop", name: "Desktop" },
  { slug: "tablet", name: "Tablet" },
  { slug: "mobile", name: "Mobile" },
];

export default async function WebPage({
  params,
  searchParams,
}: {
  params: Promise<{ facet?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { facet } = await params;
  const sp = await searchParams;
  const fromPath = facetToFilters(facet, [
    { param: "category", list: CATEGORIES },
    { param: "industry", list: INDUSTRIES },
    { param: "style", list: STYLES },
    { param: "tech", list: TECHNOLOGIES },
  ]);

  const label =
    name(CATEGORIES, fromPath.category) ||
    name(INDUSTRIES, fromPath.industry) ||
    name(STYLES, fromPath.style) ||
    name(TECHNOLOGIES, fromPath.tech);

  return (
    <FeedPage
      title={label ? `${label} websites` : "Websites"}
      sub="Full pages captured from live products. Switch device to see the responsive capture of the same screen."
      base={{ kind: "screen", platform: "web", ...fromPath }}
      params={sp}
      defs={[
        { param: "category", label: "Type", options: CATEGORIES },
        { param: "industry", label: "Industry", options: INDUSTRIES },
        { param: "style", label: "Style", options: STYLES },
        { param: "tech", label: "Tech", options: TECHNOLOGIES },
        { param: "device", label: "Device", options: DEVICES },
      ]}
    />
  );
}
