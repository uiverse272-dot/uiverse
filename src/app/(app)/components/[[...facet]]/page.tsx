import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { SCOPES } from "@/lib/query";
import { COMPONENT_TYPES, INDUSTRIES, STYLES, TECHNOLOGIES, name } from "@/lib/taxonomy";

type Params = Promise<{ facet?: string[] }>;

async function resolve(params: Params) {
  const { facet } = await params;
  const fromPath = facetToFilters(facet, [
    { param: "componentType", list: COMPONENT_TYPES },
    { param: "style", list: STYLES },
    { param: "tech", list: TECHNOLOGIES },
  ]);
  if (!fromPath) notFound();

  const label = name(COMPONENT_TYPES, fromPath.componentType);
  return { fromPath, title: label ? `${label} components` : "Components" };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: (await resolve(params)).title };
}

export default async function ComponentsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { fromPath, title } = await resolve(params);
  const sp = await searchParams;

  return (
    <FeedPage
      title={title}
      sub="Every component here is a crop of a real screen, so you can always see where it came from and how it was used."
      base={{ ...SCOPES.components.base, ...fromPath }}
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
