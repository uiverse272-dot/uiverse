import type { Metadata } from "next";
import { ITEMS, bySlug, type Kind } from "@/lib/data";
import { similarTo } from "@/lib/query";
import { itemTitle, sourceAbout } from "@/i18n/content";
import { alternates, getI18n } from "@/i18n/server";

/* the kind must match the route, or /screen/<component> would serve the same page under a second URL */
export function loadDetail(slug: string, kind: Kind) {
  const item = bySlug(slug);
  if (!item || item.kind !== kind) return null;
  return {
    item,
    similar: similarTo(item, 60),
    fromSource: ITEMS.filter((i) => i.source.slug === item.source.slug && i.kind === "screen"),
  };
}

export async function detailMetadata(slug: string, kind: Kind): Promise<Metadata> {
  const item = bySlug(slug);
  if (!item || item.kind !== kind) return {};
  const { lang, t } = await getI18n();
  return {
    title: `${itemTitle(item, lang)} — ${item.source.name}`,
    description: `${item.source.name}: ${sourceAbout(item.source, lang)} ${t.detail.metaDescription}`,
    alternates: alternates(lang, `/${kind}/${slug}`),
    /* procedural items are invented brands — fine to browse, not something to put in search results */
    robots: item.capture || item.live ? undefined : { index: false, follow: true },
  };
}
