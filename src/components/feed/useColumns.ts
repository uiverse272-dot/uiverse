"use client";

import { useEffect, useSyncExternalStore } from "react";
import { COLS_COOKIE } from "./colsCookie";

/* thresholds account for the 88px desktop rail */
const BREAKPOINTS: [min: number, cols: number][] = [
  [1900, 6],
  [1540, 5],
  [1180, 4],
  [760, 3],
  [0, 2],
];

/* a number, so it's a stable snapshot without caching anything */
const read = () => BREAKPOINTS.find(([min]) => window.innerWidth >= min)![1];

function subscribe(cb: () => void) {
  window.addEventListener("resize", cb, { passive: true });
  return () => window.removeEventListener("resize", cb);
}

/**
 * Column count derived from viewport width. `ssr` is what the server rendered with (see
 * ssrColumns) — hydration must use the same number, then the real width takes over.
 */
export function useColumns(override?: number, ssr = 4) {
  const cols = useSyncExternalStore(subscribe, read, () => ssr);
  /* read by ssrColumns, so the next page the server renders already has this count */
  useEffect(() => {
    document.cookie = `${COLS_COOKIE}=${cols}; path=/; max-age=31536000; samesite=lax`;
  }, [cols]);
  if (override) return Math.min(override, cols === 2 ? 2 : override);
  return cols;
}
