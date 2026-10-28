"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { tagName, type Find } from "@/lib/finds";
import { External } from "../ui/icons";

/**
 * A find, framed like a feed card: the image opens the original where it lives, the caption
 * credits the creator and links to their page. Nothing here stays on Uiverse — finds send people
 * to the work.
 */
export function FindCard({ find, eager = false }: { find: Find; eager?: boolean }) {
  const { lang, t } = useI18n();
  return (
    <div className="group">
      <a
        href={find.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${find.title} — ${t.finds.open}`}
        className="block border border-border bg-surface p-1.5 transition-[transform,box-shadow] duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0_var(--border)] focus-visible:shadow-[4px_4px_0_var(--focus)] focus-visible:outline-none"
      >
        <div className="relative overflow-hidden border border-border">
          <Image
            src={find.image.src}
            width={find.image.w}
            height={find.image.h}
            sizes="(max-width: 768px) 50vw, 340px"
            alt=""
            {...(eager ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          <span className="absolute bottom-1.5 end-1.5 border border-border bg-surface p-1 opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden">
            <External size={12} />
          </span>
        </div>
      </a>
      <div className="mt-2.5">
        <div dir="auto" className="line-clamp-2 font-display text-[13.5px] leading-snug">{find.title}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-text-2">
          <a href={find.creatorUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate hover:text-text">
            {fill(t.finds.by, { creator: find.creator })}
          </a>
          {find.tags[0] ? <span className="shrink-0 text-text-3">· {tagName(find.tags[0], lang)}</span> : null}
        </div>
      </div>
    </div>
  );
}
