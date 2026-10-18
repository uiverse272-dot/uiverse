import { bySlug } from "@/lib/data";
import { isLang } from "@/i18n/config";
import { itemCard, OG_SIZE, siteCard } from "@/lib/og";

export const alt = "Screen preview with its palette";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const l = isLang(lang) ? lang : "en";
  const item = bySlug(slug);
  return item?.kind === "screen" ? itemCard(item, l) : siteCard(l);
}
