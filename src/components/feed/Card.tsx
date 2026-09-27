"use client";

import Link from "next/link";
import { compact, type Item } from "@/lib/data";
import { MockScreen } from "../mock/MockScreen";
import { SaveButton } from "../save/SaveButton";
import { Code, Layers, Sparkle } from "../ui/icons";

/**
 * A framed plate: the capture sits inside a ruled mat, the caption reads like a
 * catalogue entry (title, source, saves) with the save toggle on the right.
 * `crop` (width / height) fixes the plate's aspect so cards line up in a row instead of a masonry.
 */
export function Card({ item, crop }: { item: Item; crop?: number }) {
  const href = item.kind === "component" ? `/component/${item.slug}` : `/screen/${item.slug}`;

  return (
    <div className="group relative">
      <Link href={href} className="block focus-visible:outline-none" prefetch={false}>
        <div className="border border-border bg-surface p-1.5 transition-[transform,box-shadow] duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0_var(--border)] group-focus-visible:shadow-[4px_4px_0_var(--accent)]">
          <div className="relative overflow-hidden border border-border">
            <MockScreen item={crop ? { ...item, aspect: crop } : item} />

            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 max-md:hidden">
              {item.hasCode ? <Badge title="Code available"><Code size={12} /></Badge> : null}
              {item.has3d ? <Badge title="3D / WebGL"><Sparkle size={12} /></Badge> : null}
              {item.kind === "component" ? <Badge title="Component"><Layers size={12} /></Badge> : null}
            </div>

            {item.tier === "premium" ? (
              <span className="absolute left-1.5 top-1.5 border border-on-signal bg-signal px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-signal">
                Pro
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-2.5 pr-8">
          <div className="line-clamp-2 font-display text-[13.5px] leading-snug">{item.title}</div>
          <div className="mt-0.5 truncate text-[11px] text-text-2">
            {item.kind === "component" ? `${item.source.name} · component` : item.source.name}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] tabular-nums">
            <span className="h-2.5 w-2.5 shrink-0 border border-border" style={{ background: item.palette.accent }} />
            {compact(item.saves)} saves
          </div>
        </div>
      </Link>

      <div className="absolute bottom-0 right-0">
        <SaveButton slug={item.slug} variant="icon" />
      </div>
    </div>
  );
}

function Badge({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <span
      title={title}
      className="flex h-6 w-6 items-center justify-center border border-[#1c1b18] bg-[#fff7e6] text-[#1c1b18]"
    >
      {children}
    </span>
  );
}
