"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { Close } from "../ui/icons";
import { useFocusTrap } from "../ui/useFocusTrap";
import { closeShell, peekSource, playClose, playOpen, shellWasUp, still } from "../motion/morph";
import { lockScroll } from "../ui/scrollLock";

/**
 * Detail opens over a live feed. The URL is real and shareable; a cold hit on the
 * same URL renders the standalone page. Closing returns to the feed with scroll,
 * loaded pages and momentum untouched. See docs/02 §4.
 *
 * Opened from a card, the card's picture grows into the frame and the sheet fades in around it;
 * closing fades the sheet and sends the picture back to its card (motion/morph.ts).
 */
export function Overlay({ slug, label, children }: { slug: string; label: string; children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const dialog = useRef<HTMLDivElement>(null);
  useFocusTrap(dialog);
  /* only ever rendered in the browser (an intercepted navigation), so reading the card is safe */
  const [grows] = useState(() => peekSource(slug) !== null);
  /* its loading shell was already on screen: carry on from it rather than enter again */
  const [continues] = useState(shellWasUp);
  const frame = () => dialog.current?.querySelector<HTMLElement>("[data-morph-target]") ?? null;

  useLayoutEffect(() => {
    if (grows) playOpen(slug, frame());
    closeShell();
  }, [grows, slug]);

  const closing = useRef(false);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = dialog.current;
    if (!el || still()) return router.back();
    playClose(slug, frame());
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-out", fill: "forwards" }).finished.then(() => router.back());
  }, [router, slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const unlock = lockScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
    };
  }, [close]);

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={`${continues ? "" : "anim-fade-in "}fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto overscroll-contain bg-[var(--overlay)] p-0 md:px-6 md:pb-6`}
    >
      {/* backdrop click target for the mouse; keyboard users have the Close button and Escape */}
      <button
        aria-hidden
        tabIndex={-1}
        onClick={close}
        className="fixed inset-0 -z-10 cursor-default"
      />
      {/* the top gap is the sheet's margin, not the overlay's padding: padding would hold the sticky
          bar 24px down and let the page show through above it */}
      <div className={`${grows || continues ? "" : "anim-sheet "}relative w-full max-w-[1700px] border border-border bg-bg md:mt-6 md:shadow-[6px_6px_0_var(--border)]`}>
        {/* a bar of its own, so nothing scrolls underneath the close button and hides behind it */}
        <div className="sticky top-0 z-10 flex h-12 items-center justify-between gap-3 border-b border-border bg-bg ps-4 md:ps-5">
          <span className="truncate text-[13px] font-medium text-text-2">{label}</span>
          <button
            onClick={close}
            className="grid h-12 w-12 shrink-0 place-items-center border-s border-border transition-colors hover:bg-accent hover:text-accent-fg"
            aria-label={t.common.close}
          >
            <Close size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
