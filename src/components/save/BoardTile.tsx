"use client";

import { Link, useI18n } from "@/i18n/client";
import { plural } from "@/i18n/format";
import type { Item } from "@/lib/data";
import { LazyPreview } from "../mock/LazyPreview";

/**
 * A board as a tile: a cover of its three newest designs — one large, two stacked, each square so
 * any design crops cleanly — its name and how many designs it holds.
 */
export function BoardTile({ href, name, items, count }: { href: string; name: string; items: Item[]; count: number }) {
  const { t, lang } = useI18n();
  const [a, b, c] = items;
  const cell = (item: Item | undefined) =>
    item ? <LazyPreview item={{ ...item, aspect: 1 }} lazy /> : <div className="aspect-square bg-bg-subtle" />;

  return (
    <Link href={href} className="group block focus-visible:outline-none" prefetch={false}>
      <div className="grid grid-cols-3 gap-1 overflow-hidden border border-border bg-surface p-1.5 transition-[transform,box-shadow] duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0_var(--border)] group-focus-visible:shadow-[4px_4px_0_var(--focus)]">
        <div aria-hidden className="col-span-2 row-span-2 overflow-hidden border border-border">{cell(a)}</div>
        <div aria-hidden className="overflow-hidden border border-border">{cell(b)}</div>
        <div aria-hidden className="overflow-hidden border border-border">{cell(c)}</div>
      </div>
      <div className="mt-2.5">
        <div className="truncate font-display text-[14px] font-semibold">
          <bdi>{name}</bdi>
        </div>
        <div className="mt-0.5 text-[12px] text-text-2">{plural(t.saved.count, count, lang)}</div>
      </div>
    </Link>
  );
}
