import type { Metadata } from "next";
import { ITEMS, bySlug, type Kind } from "@/lib/data";
import { similarTo } from "@/lib/query";

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

export function detailMetadata(slug: string, kind: Kind): Metadata {
  const item = bySlug(slug);
  if (!item || item.kind !== kind) return {};
  return {
    title: `${item.title} — ${item.source.name}`,
    description: `${item.source.name}: ${item.source.about} Breakdown, palette, type scale and responsive behaviour.`,
  };
}
