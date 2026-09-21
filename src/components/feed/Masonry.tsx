"use client";

import { useMemo, type ReactNode } from "react";
import type { Item } from "@/lib/data";
import { useColumns } from "./useColumns";

/**
 * Column-balanced masonry.
 *
 * Placement uses the aspect ratio stored on each item, so the whole layout is
 * computed before a single pixel is painted — nothing measures the DOM and
 * nothing reflows. Assignment is incremental: appending items continues from
 * the current column heights, so previously placed cards never move.
 */
export function Masonry({
  items,
  render,
  gap = 16,
  maxCols,
}: {
  items: Item[];
  render: (item: Item, index: number) => ReactNode;
  gap?: number;
  maxCols?: number;
}) {
  const cols = useColumns(maxCols);

  const columns = useMemo(() => {
    const buckets: { item: Item; index: number }[][] = Array.from({ length: cols }, () => []);
    const heights = new Array(cols).fill(0);
    items.forEach((item, index) => {
      let target = 0;
      for (let c = 1; c < cols; c++) if (heights[c] < heights[target]) target = c;
      buckets[target].push({ item, index });
      /* unit height = 1 / aspect, plus a constant for the caption block */
      heights[target] += 1 / item.aspect + 0.14;
    });
    return buckets;
  }, [items, cols]);

  return (
    <div style={{ display: "flex", gap, alignItems: "flex-start" }}>
      {columns.map((col, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap, flex: 1, minWidth: 0 }}>
          {col.map(({ item, index }) => (
            <div key={item.slug}>{render(item, index)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
