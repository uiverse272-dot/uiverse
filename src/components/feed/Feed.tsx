"use client";

import { useEffect, useRef, useState } from "react";
import type { Item } from "@/lib/data";
import { Masonry } from "./Masonry";
import { Card } from "./Card";

const PAGE = 28;
const AUTO_PAGES = 5;

export function Feed({ items, maxCols }: { items: Item[]; maxCols?: number }) {
  const [pages, setPages] = useState(1);
  const [seen, setSeen] = useState(items);
  const sentinel = useRef<HTMLDivElement>(null);

  /* new result set (filter change) — reset pagination during render, not in an effect */
  if (seen !== items) {
    setSeen(items);
    setPages(1);
  }

  useEffect(() => {
    if (pages >= AUTO_PAGES) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setPages((p) => Math.min(p + 1, AUTO_PAGES));
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pages]);

  const shown = items.slice(0, pages * PAGE);
  const more = shown.length < items.length;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[46vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-[15px] font-medium">Nothing matches those filters</p>
        <p className="max-w-sm text-[13.5px] text-text-2">
          Try removing a filter, or browse Explore to start from a category instead.
        </p>
      </div>
    );
  }

  return (
    <>
      <Masonry items={shown} maxCols={maxCols} render={(item) => <Card item={item} />} />
      <div ref={sentinel} className="h-px" />
      {more ? (
        <div className="flex justify-center py-10">
          <button
            onClick={() => setPages((p) => p + 1)}
            className="rounded-[9px] border border-border px-4 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-bg-subtle"
          >
            Load more
          </button>
        </div>
      ) : (
        <div className="py-10 text-center text-[12.5px] text-text-3">
          {items.length} results · end of feed
        </div>
      )}
    </>
  );
}
