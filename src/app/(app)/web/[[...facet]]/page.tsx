import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { SCOPES } from "@/lib/query";
import { CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES, name } from "@/lib/taxonomy";

type Params = Promise<{ facet?: string[] }>;

async function resolve(params: Params) {
  const { facet } = await params;
  const fromPath = facetToFilters(facet, [
    { param: "category", list: CATEGORIES },
    { param: "industry", list: INDUSTRIES },
    { param: "style", list: STYLES },
    { param: "tech", list: TECHNOLOGIES },
  ]);
  if (!fromPath) notFound();

  const label =
    name(CATEGORIES, fromPath.category) ||
    name(INDUSTRIES, fromPath.industry) ||
    name(STYLES, fromPath.style) ||
    name(TECHNOLOGIES, fromPath.tech);
  return { fromPath, title: label ? `${label} websites` : "Websites" };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: (await resolve(params)).title };
}

export default async function WebPage({
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
      sub="Full pages captured from live products. Open one to see the same screen at laptop, tablet and mobile sizes."
      base={{ ...SCOPES.web.base, ...fromPath }}
      params={sp}
      defs={[
        { param: "category", label: "Type", options: CATEGORIES },
        { param: "industry", label: "Industry", options: INDUSTRIES },
        { param: "style", label: "Style", options: STYLES },
        { param: "tech", label: "Tech", options: TECHNOLOGIES },
      ]}
    />
  );
}
