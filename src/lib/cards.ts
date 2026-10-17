import type { Item } from "./data";

/**
 * The still a feed card shows for a real capture: the top of the page for a screen, the block for
 * a component — cut from the laptop screenshot once (`npm run capture:cards`) rather than sending
 * the whole page, 4–10k pixels tall, to show its first screen. Pure, so the script that writes the
 * files and the card that reads them can't disagree.
 */
export const CARD_W = 720;

export function cardOf(item: Item) {
  const cap = item.capture;
  if (!cap) return null;
  const shot = cap.shots.desktop;
  const crop = item.kind === "component" ? (cap.crops?.desktop ?? item.crop) : undefined;
  /* CSS pixels: a component's block, or as much of the page as the card frame shows. A block
     measured a few pixels above the page top starts at the top */
  const y = crop ? crop.y * shot.docH : 0;
  const top = Math.max(0, y);
  const height = Math.min((crop ? crop.h * shot.docH : shot.css / item.aspect) - (top - y), shot.cssH - top);
  const scale = shot.w / shot.css;
  const px = Math.min(Math.round(top * scale), shot.h - 1);
  return {
    src: shot.src.replace(/[^/]+$/, `card-${item.slug}.jpg`),
    from: shot.src,
    /* device pixels of the source screenshot */
    region: { left: 0, top: px, width: shot.w, height: Math.max(1, Math.min(Math.round(height * scale), shot.h - px)) },
    w: CARD_W,
    h: Math.max(1, Math.round((CARD_W * height) / shot.css)),
  };
}
