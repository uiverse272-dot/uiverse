import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { fill } from "@/i18n/format";
import { alternates, getI18n } from "@/i18n/server";
import { SCOPES } from "@/lib/query";
import { CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES, name } from "@/lib/taxonomy";

type Params = Promise<{ facet?: string[] }>;

async function resolve(params: Params) {
  const { facet } = await params;
  const { lang, t } = await getI18n();
  const fromPath = facetToFilters(facet, [
    { param: "category", list: CATEGORIES },
    { param: "industry", list: INDUSTRIES },
    { param: "style", list: STYLES },
    { param: "tech", list: TECHNOLOGIES },
  ]);
  if (!fromPath) notFound();

  const label =
    name(CATEGORIES, fromPath.category, lang) ||
    name(INDUSTRIES, fromPath.industry, lang) ||
    name(STYLES, fromPath.style, lang) ||
    name(TECHNOLOGIES, fromPath.tech, lang);
  const path = ["/web", ...(facet ?? [])].join("/");
  return { fromPath, lang, t, path, title: label ? fill(t.feeds.web.titleWith, { label }) : t.feeds.web.title };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { title, lang, path } = await resolve(params);
  return { title, alternates: alternates(lang, path) };
}

export default async function WebPage({
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
      sub={t.feeds.web.sub}
      base={{ ...SCOPES.web.base, ...fromPath }}
      params={sp}
      defs={[
        { param: "category", label: t.filters.type, options: CATEGORIES },
        { param: "industry", label: t.filters.industry, options: INDUSTRIES },
        { param: "style", label: t.filters.style, options: STYLES },
        { param: "tech", label: t.filters.tech, options: TECHNOLOGIES },
      ]}
    />
  );
}
