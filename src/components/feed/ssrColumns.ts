import { cookies, headers } from "next/headers";
import { COLS_COOKIE } from "./colsCookie";

/**
 * The server can't see the viewport, so a fixed guess made the feed reflow after hydration — 5→2 on
 * phones, 5→4 on the most common laptop widths (1280–1536), a visible jump either way. Once a
 * browser has rendered a feed it remembers its column count in a cookie, so from the second page on
 * the server renders exactly what the client will. Before that, the user agent picks: phones 2,
 * everything else 4 (the common laptop count).
 *
 * Reading request data makes a route dynamic — only call this from pages that already are.
 */
export async function ssrColumns() {
  const remembered = Number((await cookies()).get(COLS_COOKIE)?.value);
  if (remembered >= 2 && remembered <= 6) return remembered;
  const ua = (await headers()).get("user-agent") ?? "";
  return /iPhone|iPod|Android.+Mobile|Mobi/i.test(ua) ? 2 : 4;
}
