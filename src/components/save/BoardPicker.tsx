"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";
import { useSaved } from "./SavedProvider";
import { Check, Plus } from "../ui/icons";

/**
 * Pin one design to any number of boards: each board is a checkbox, and naming a new one creates
 * it with the design already on it. Pinning saves the design if it wasn't saved.
 */
export function BoardPicker({ slug, autoFocus = false }: { slug: string; autoFocus?: boolean }) {
  const { t } = useI18n();
  const { boards, boardsOf, pin, create } = useSaved();
  const [name, setName] = useState("");
  const on = new Set(boardsOf(slug));

  return (
    <div>
      <div className="px-1 pb-2 text-[12px] font-medium text-text-3">{t.save.pickBoards}</div>
      {boards.length ? (
        <ul className="max-h-52 overflow-auto">
          {boards.map((b) => (
            <li key={b.id}>
              <button
                role="checkbox"
                aria-checked={on.has(b.id)}
                onClick={() => pin(slug, b.id, !on.has(b.id))}
                className="flex w-full items-center gap-2.5 px-2 py-2 text-start text-[13px] hover:bg-bg-subtle"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center border border-border ${
                    on.has(b.id) ? "bg-accent text-accent-fg" : ""
                  }`}
                >
                  {on.has(b.id) ? <Check size={11} /> : null}
                </span>
                <bdi className="truncate">{b.name}</bdi>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2 pb-1 text-[12.5px] text-text-2">{t.save.noBoards}</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          pin(slug, create(name.trim()), true);
          setName("");
        }}
        className="mt-1 flex items-center gap-2 border-t border-border px-1 pt-2"
      >
        <Plus size={14} />
        <input
          autoFocus={autoFocus}
          dir="auto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder={t.save.newBoard}
          aria-label={t.save.newBoard}
          className="flex-1 bg-transparent py-1 text-[13px] outline-none placeholder:text-text-3"
        />
      </form>
    </div>
  );
}
