"use client";

import { useLayoutEffect, type RefObject } from "react";
import { still } from "./morph";

/**
 * Cards rise in as they scroll into view. Only a card that starts below the screen waits for
 * it: what the first screen shows is never hidden, so nothing flashes at load and nothing waits
 * for a script to appear. Cards that arrive together are staggered a little.
 */
let io: IntersectionObserver | null = null;

function observer() {
  if (io) return io;
  io = new IntersectionObserver(
    (entries) => {
      let n = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.style.setProperty("--rd", `${Math.min(n++, 5) * 45}ms`);
        el.dataset.reveal = "in";
        io!.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -6% 0px" },
  );
  return io;
}

export function useReveal(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || still()) return;
    if (el.getBoundingClientRect().top < innerHeight) return;
    el.dataset.reveal = "wait";
    const o = observer();
    o.observe(el);
    return () => o.unobserve(el);
  }, [ref]);
}
