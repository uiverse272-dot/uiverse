"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { plural } from "@/i18n/format";
import { BoardPicker } from "./BoardPicker";
import { useSaved } from "./SavedProvider";
import { Chevron, Grid } from "../ui/icons";

/** On a design's page: which boards it's on, and a picker to change that without saving first. */
export function BoardsButton({ slug }: { slug: string }) {
  const { t, lang } = useI18n();
  const { boardsOf } = useSaved();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const n = boardsOf(slug).length;

  /* closes on Escape or a click outside, like the other popovers */
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-11 w-full items-center justify-center gap-2 border border-border bg-surface text-[13.5px] hover:bg-bg-subtle"
      >
        <Grid size={15} /> {n ? plural(t.save.onBoards, n, lang) : t.save.addToBoard}
        <Chevron size={14} className={open ? "rotate-180" : ""} />
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-30 mt-1 border border-border bg-surface p-2 shadow-[4px_4px_0_var(--border)]">
          <BoardPicker slug={slug} autoFocus />
          <button
            onClick={() => setOpen(false)}
            className="mt-2 h-8 w-full border border-border text-[12.5px] font-medium hover:bg-bg-subtle"
          >
            {t.save.done}
          </button>
        </div>
      ) : null}
    </div>
  );
}
