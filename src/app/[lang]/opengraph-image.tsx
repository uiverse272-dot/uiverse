import { OG_SIZE, siteCard } from "@/lib/og";

export const alt = "Uiverse — interfaces worth building";
export const size = OG_SIZE;
export const contentType = "image/png";

/* here rather than at app/: every page lives under [lang], and the image applies to its own segment
   and the ones below it — at app/ it reached no page at all */
export default function Image() {
  return siteCard();
}
