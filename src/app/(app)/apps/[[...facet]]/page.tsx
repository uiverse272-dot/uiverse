import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { SCOPES } from "@/lib/query";
import { CATEGORIES, INDUSTRIES, PLATFORMS, STYLES, name } from "@/lib/taxonomy";

type Params = Promise<{ facet?: string[] }>;

async function resolve(params: Params) {
  const { facet } = await params;
  const fromPath = facetToFilters(facet, [
    { param: "platform", list: PLATFORMS },
    { param: "industry", list: INDUSTRIES },
    { param: "category", list: CATEGORIES },
  ]);
  if (!fromPath) notFound();

  const label = name(PLATFORMS, fromPath.platform) || name(INDUSTRIES, fromPath.industry);
  return { fromPath, title: label ? `${label} apps` : "Mobile & app UI" };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: (await resolve(params)).title };
}

export default async function AppsPage({
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
      sub="Screens from shipped mobile products. Flows — ordered runs of screens — arrive in Phase 2."
      base={{ ...SCOPES.apps.base, ...fromPath }}
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
