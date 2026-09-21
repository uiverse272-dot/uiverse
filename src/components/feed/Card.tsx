"use client";

import Link from "next/link";
import { compact, type Item } from "@/lib/data";
import { MockScreen } from "../mock/MockScreen";
import { SaveButton } from "../save/SaveButton";
import { Code, Dots, Layers, Sparkle } from "../ui/icons";

export function Card({ item }: { item: Item }) {
  const href = item.kind === "component" ? `/component/${item.slug}` : `/screen/${item.slug}`;

  return (
    <Link href={href} className="group block focus-visible:outline-none" prefetch={false}>
      <div className="relative overflow-hidden rounded-[12px] border border-border bg-surface transition-[border-color] duration-150 group-hover:border-border-strong group-focus-visible:ring-2 group-focus-visible:ring-[var(--focus)]">
        <MockScreen item={item} />

        {/* hover scrim + actions — all mirrored in the card menu for touch */}
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/[0.14]" />

        <div className="absolute right-2 top-2 flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 max-md:opacity-100">
          <SaveButton slug={item.slug} />
          <button
            onClick={(e) => e.preventDefault()}
            aria-label="More"
            className="hidden h-8 w-8 items-center justify-center rounded-[7px] md:flex bg-[rgb(10_10_10/0.72)] text-white backdrop-blur-md transition-colors hover:bg-[rgb(10_10_10/0.88)]"
          >
            <Dots size={15} />
          </button>
        </div>

        <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 max-md:hidden">
          <span className="inline-flex max-w-[70%] items-center gap-1.5 rounded-[7px] bg-[rgb(10_10_10/0.72)] px-2 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-md">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: item.palette.accent }}
            />
            <span className="truncate">{item.source.name}</span>
          </span>
          <span className="flex items-center gap-1">
            {item.hasCode ? <Badge title="Code available"><Code size={12} /></Badge> : null}
            {item.has3d ? <Badge title="3D / WebGL"><Sparkle size={12} /></Badge> : null}
            {item.kind === "component" ? <Badge title="Component"><Layers size={12} /></Badge> : null}
          </span>
        </div>

        {item.tier === "premium" ? (
          <span className="absolute left-2 top-2 rounded-[6px] bg-[rgb(10_10_10/0.72)] px-1.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
            Pro
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3 px-0.5">
        <span className="truncate text-[13px] font-medium leading-tight">{item.title}</span>
        <span className="shrink-0 text-[12px] text-text-3 tabular-nums">{compact(item.saves)}</span>
      </div>
      <div className="mt-0.5 truncate px-0.5 text-[12px] text-text-3">
        {item.kind === "component" ? `${item.source.name} · component` : item.source.name}
      </div>
    </Link>
  );
}

function Badge({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <span
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[rgb(10_10_10/0.72)] text-white backdrop-blur-md"
    >
      {children}
    </span>
  );
}
