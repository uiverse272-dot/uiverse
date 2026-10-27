"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { BoardPicker } from "./BoardPicker";
import { useSaved } from "./SavedProvider";
import { Check } from "../ui/icons";

/**
 * Saving never opens a dialog. It happens, then this offers the move.
 * Pinning to boards is a separate, optional act — see docs/10 §4.1.
 */
export function SaveToast() {
  const { t } = useI18n();
  const { toast, clearToast } = useSaved();
  const [picking, setPicking] = useState(false);
  const [held, setHeld] = useState(false);
  const [shown, setShown] = useState(toast);

  /* a new save replaces the toast — drop back from the picker so it can't pin the wrong design */
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
          /* also on any pointer movement: a pointer that arrives without a hover (a touch, an
             automated click) still holds the toast open */
          onPointerMove={() => setHeld(true)}
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
                    {t.save.addToBoard}
                  </button>
                ) : null}
                <button onClick={clearToast} className="px-1 text-[12.5px] text-text-3 hover:text-text">
                  {t.common.dismiss}
                </button>
              </div>
            ) : toast.slug ? (
              <div>
                <BoardPicker slug={toast.slug} autoFocus />
                <button
                  onClick={clearToast}
                  className="mt-2 h-8 w-full border border-border text-[12.5px] font-medium hover:bg-bg-subtle"
                >
                  {t.save.done}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
