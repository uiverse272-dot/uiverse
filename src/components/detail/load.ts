import { ITEMS, bySlug } from "@/lib/data";
import { similarTo } from "@/lib/query";

export function loadDetail(slug: string) {
  const item = bySlug(slug);
  if (!item) return null;
  return {
    item,
    similar: similarTo(item, 12),
    fromSource: ITEMS.filter((i) => i.source.slug === item.source.slug && i.kind === "screen"),
  };
}
