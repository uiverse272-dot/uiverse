"use client";

import { useSyncExternalStore } from "react";

const BREAKPOINTS: [min: number, cols: number][] = [
  [1800, 6],
  [1440, 5],
  [1100, 4],
  [760, 3],
  [0, 2],
];

function read() {
  if (typeof window === "undefined") return 5;
  const w = window.innerWidth;
  return BREAKPOINTS.find(([min]) => w >= min)![1];
}

let cached = 5;

function subscribe(cb: () => void) {
  const handler = () => {
    const next = read();
    if (next !== cached) {
      cached = next;
      cb();
    }
  };
  window.addEventListener("resize", handler, { passive: true });
  handler();
  return () => window.removeEventListener("resize", handler);
}

/** Column count derived from viewport width, SSR-safe. */
export function useColumns(override?: number) {
  const cols = useSyncExternalStore(
    subscribe,
    () => cached,
    () => 5,
  );
  if (override) return Math.min(override, cols === 2 ? 2 : override);
  return cols;
}
