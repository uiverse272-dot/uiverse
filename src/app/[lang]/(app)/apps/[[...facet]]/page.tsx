import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedPage, facetToFilters } from "@/components/feed/FeedPage";
import { fill } from "@/i18n/format";
import { alternates, getI18n } from "@/i18n/server";
import { SCOPES } from "@/lib/query";
import { CATEGORIES, INDUSTRIES, PLATFORMS, STYLES, name } from "@/lib/taxonomy";

type Params = Promise<{ facet?: string[] }>;

async function resolve(params: Params) {
  const { facet } = await params;
  const { lang, t } = await getI18n();
  const fromPath = facetToFilters(facet, [
    { param: "platform", list: PLATFORMS },
    { param: "industry", list: INDUSTRIES },
    { param: "category", list: CATEGORIES },
  ]);
  if (!fromPath) notFound();

  const label = name(PLATFORMS, fromPath.platform, lang) || name(INDUSTRIES, fromPath.industry, lang);
  const path = ["/apps", ...(facet ?? [])].join("/");
  return { fromPath, lang, t, path, title: label ? fill(t.feeds.apps.titleWith, { label }) : t.feeds.apps.title };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { title, lang, path } = await resolve(params);
  return { title, alternates: alternates(lang, path) };
}

export default async function AppsPage({
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
      sub={t.feeds.apps.sub}
      base={{ ...SCOPES.apps.base, ...fromPath }}
      params={sp}
      defs={[
        { param: "platform", label: t.filters.platform, options: PLATFORMS },
        { param: "category", label: t.filters.screen, options: CATEGORIES },
        { param: "industry", label: t.filters.category, options: INDUSTRIES },
        { param: "style", label: t.filters.style, options: STYLES },
      ]}
    />
  );
}
