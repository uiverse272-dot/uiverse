"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { useSaved } from "./SavedProvider";
import { Check, Plus } from "../ui/icons";

/**
 * Saving never opens a dialog. It happens, then this offers the move.
 * Choosing a board is a separate, optional act — see docs/10 §4.1.
 */
export function SaveToast() {
  const { t } = useI18n();
  const { toast, clearToast, collections, move, create } = useSaved();
  const [picking, setPicking] = useState(false);
  const [name, setName] = useState("");
  const [held, setHeld] = useState(false);
  const [shown, setShown] = useState(toast);

  /* a new save replaces the toast — drop back from the picker so it can't move the wrong item */
  if (shown !== toast) {
    setShown(toast);
    setPicking(false);
  }

  /* fades after a few seconds, but never while the pointer or focus is on it, or a board is being picked */
  useEffect(() => {
    if (!toast || picking || held) return;
    /* long enough to reach "Move to…" without hurrying; hovering or focusing holds it open */
    const t = setTimeout(clearToast, 10000);
    return () => clearTimeout(t);
  }, [toast, picking, held, clearToast]);

  return (
    <>
      {/* always mounted: a live region only announces changes to an element that already exists */}
      <div aria-live="polite" className="sr-only">
        {toast?.text}
      </div>
      {toast ? (
        <div
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
          className="fixed bottom-20 left-1/2 z-[80] w-[min(420px,calc(100vw-32px))] -translate-x-1/2 md:bottom-7"
        >
          <div className="anim-fade-up border border-border bg-surface p-3 shadow-[4px_4px_0_var(--border)]">
            {!picking ? (
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg">
                  <Check size={13} />
                </span>
                <span className="flex-1 truncate text-[13.5px] font-medium">{toast.text}</span>
                {toast.slug ? (
                  <button
                    onClick={() => setPicking(true)}
                    className="border border-border px-2.5 py-1.5 text-[12.5px] font-medium hover:bg-bg-subtle"
                  >
                    {t.save.moveTo}
                  </button>
                ) : null}
                <button onClick={clearToast} className="px-1 text-[12.5px] text-text-3 hover:text-text">
                  {t.common.dismiss}
                </button>
              </div>
            ) : (
              <div>
                <div className="px-1 pb-2 text-[12px] font-medium text-text-3">{t.save.moveToCollection}</div>
                <div className="max-h-52 overflow-auto">
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        if (toast.slug) move(toast.slug, c.id);
                        setPicking(false);
                      }}
                      className="flex w-full items-center gap-2 px-2 py-2 text-start text-[13px] hover:bg-bg-subtle"
                    >
                      <bdi>{c.name}</bdi>
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!name.trim() || !toast.slug) return;
                    const id = create(name.trim());
                    move(toast.slug, id);
                    setName("");
                    setPicking(false);
                  }}
                  className="mt-1 flex items-center gap-2 border-t border-border pt-2"
                >
                  <Plus size={14} />
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.save.newCollection}
                    className="flex-1 bg-transparent py-1 text-[13px] outline-none placeholder:text-text-3"
                  />
                </form>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
