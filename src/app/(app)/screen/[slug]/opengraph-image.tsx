import { bySlug } from "@/lib/data";
import { itemCard, OG_SIZE, siteCard } from "@/lib/og";

export const alt = "Screen preview with its palette";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const item = bySlug((await params).slug);
  return item?.kind === "screen" ? itemCard(item) : siteCard();
}
