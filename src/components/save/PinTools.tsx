"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";
import { useSaved } from "./SavedProvider";

/**
 * Under a card on Saved: the person's note on the design, editable in place, and — on a board —
 * taking it off that board. The note belongs to the design, so it reads the same on every board.
 */
export function PinTools({ slug, boardId }: { slug: string; boardId?: string }) {
  const { t } = useI18n();
  const { noteOf, note, pin } = useSaved();
  const saved = noteOf(slug);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          note(slug, draft);
          setEditing(false);
        }}
        className="mt-2 flex flex-col gap-1.5"
      >
        <textarea
          autoFocus
          dir="auto"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={t.saved.notePlaceholder}
          aria-label={t.saved.editNote}
          className="resize-none border border-border bg-surface px-2 py-1.5 text-[12.5px] outline-none placeholder:text-text-3 focus:border-border-strong"
        />
        <div className="flex gap-1.5">
          <button type="submit" className="h-7 bg-accent px-2.5 text-[12px] font-medium text-accent-fg">
            {t.saved.saveNote}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="h-7 border border-border px-2.5 text-[12px] hover:bg-bg-subtle">
            {t.saved.cancel}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-1.5">
      {saved ? <p dir="auto" className="whitespace-pre-line border-s-2 border-accent ps-2 text-[12px] leading-snug text-text-2">{saved}</p> : null}
      <div className="mt-1 flex flex-wrap gap-x-3 text-[11.5px] text-text-3">
        <button
          onClick={() => {
            setDraft(saved);
            setEditing(true);
          }}
          className="hover:text-text"
        >
          {saved ? t.saved.editNote : t.saved.addNote}
        </button>
        {boardId ? (
          <button onClick={() => pin(slug, boardId, false)} className="hover:text-text">
            {t.saved.removeFromBoard}
          </button>
        ) : null}
      </div>
    </div>
  );
}
