import type { Metadata } from "next";
import { ITEMS, bySlug, type Kind } from "@/lib/data";
import { similarTo } from "@/lib/query";
import { itemTitle } from "@/i18n/content";
import { alternates, getLang } from "@/i18n/server";

/* the kind must match the route, or /screen/<component> would serve the same page under a second URL */
export function loadDetail(slug: string, kind: Kind) {
  const item = bySlug(slug);
  if (!item || item.kind !== kind) return null;
  return {
    item,
    similar: similarTo(item, 12),
    fromSource: ITEMS.filter((i) => i.source.slug === item.source.slug && i.kind === "screen"),
  };
}

const DESCRIBE = {
  en: "Breakdown, palette, type scale and responsive behaviour.",
  ar: "التفكيك ولوحة الألوان ومقياس الخطوط والتجاوب.",
};

export async function detailMetadata(slug: string, kind: Kind): Promise<Metadata> {
  const item = bySlug(slug);
  if (!item || item.kind !== kind) return {};
  const lang = await getLang();
  return {
    title: `${itemTitle(item, lang)} — ${item.source.name}`,
    description: `${item.source.name}: ${item.source.about} ${DESCRIBE[lang]}`,
    alternates: alternates(lang, `/${kind}/${slug}`),
    /* procedural items are invented brands — fine to browse, not something to put in search results */
    robots: item.capture ? undefined : { index: false, follow: true },
  };
}
