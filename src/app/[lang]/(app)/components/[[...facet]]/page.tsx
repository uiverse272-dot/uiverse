import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { fill } from "@/i18n/format";
import { alternates, getI18n } from "@/i18n/server";
import { SCOPES } from "@/lib/query";
import { COMPONENT_TYPES, INDUSTRIES, STYLES, TECHNOLOGIES, name } from "@/lib/taxonomy";

type Params = Promise<{ facet?: string[] }>;

async function resolve(params: Params) {
  const { facet } = await params;
  const { lang, t } = await getI18n();
  const fromPath = facetToFilters(facet, [
    { param: "componentType", list: COMPONENT_TYPES },
    { param: "style", list: STYLES },
    { param: "tech", list: TECHNOLOGIES },
  ]);
  if (!fromPath) notFound();

  const label = name(COMPONENT_TYPES, fromPath.componentType, lang);
  const path = ["/components", ...(facet ?? [])].join("/");
  return { fromPath, lang, t, path, title: label ? fill(t.feeds.components.titleWith, { label }) : t.feeds.components.title };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { title, lang, path } = await resolve(params);
  return { title, alternates: alternates(lang, path) };
}

export default async function ComponentsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { fromPath, title, t } = await resolve(params);
  const sp = await searchParams;

  return (
    <FeedPage
      title={title}
      sub={t.feeds.components.sub}
      base={{ ...SCOPES.components.base, ...fromPath }}
      params={sp}
      defs={[
        { param: "component", label: t.filters.component, options: COMPONENT_TYPES },
        { param: "industry", label: t.filters.industry, options: INDUSTRIES },
        { param: "style", label: t.filters.style, options: STYLES },
        { param: "tech", label: t.filters.framework, options: TECHNOLOGIES },
      ]}
    />
  );
}
