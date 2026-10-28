"use client";

import { useEffect, useRef, useState } from "react";
import type { Item } from "@/lib/data";
import { MockScreen } from "./MockScreen";

/*
 * A preview in a grid (feed cards, Explore tiles). A sample design is drawn in HTML — a few
 * hundred elements each — so a long grid drawn up front runs to thousands. With `lazy` it's drawn
 * as it comes within reach; until then the frame holds its size in the design's own background.
 * Its text is invented, so it's hidden from screen readers — the caption beside it names it. Real
 * captures and originals are one image either way; `eager` fetches it first, for what a page opens on.
 */
export function LazyPreview({ item, lazy = false, eager = false }: { item: Item; lazy?: boolean; eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(!lazy || !!item.capture || !!item.live);
  useEffect(() => {
    if (near || !ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "800px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [near]);
  if (item.capture || item.live) return <MockScreen item={item} eager={eager} />;
  if (!near) return <div ref={ref} style={{ aspectRatio: String(item.aspect), background: item.palette.bg }} />;
  return (
    <div aria-hidden>
      <MockScreen item={item} />
    </div>
  );
}
