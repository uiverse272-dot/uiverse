"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { Close } from "../ui/icons";
import { useFocusTrap } from "../ui/useFocusTrap";

/**
 * Detail opens over a live feed. The URL is real and shareable; a cold hit on the
 * same URL renders the standalone page. Closing returns to the feed with scroll,
 * loaded pages and momentum untouched. See docs/02 §4.
 */
export function Overlay({ label, children }: { label: string; children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const dialog = useRef<HTMLDivElement>(null);
  useFocusTrap(dialog);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.back();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [router]);

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto overscroll-contain bg-[var(--overlay)] p-0 md:p-6"
    >
      {/* backdrop click target for the mouse; keyboard users have the Close button and Escape */}
      <button
        aria-hidden
        tabIndex={-1}
        onClick={() => router.back()}
        className="fixed inset-0 -z-10 cursor-default"
      />
      <div className="anim-sheet relative w-full max-w-[1700px] border border-border bg-bg md:shadow-[6px_6px_0_var(--border)]">
        <button
          onClick={() => router.back()}
          className="sticky end-0 top-0 z-10 float-end m-3 flex h-9 w-9 items-center justify-center border border-border bg-surface transition-colors hover:bg-accent hover:text-accent-fg"
          aria-label={t.common.close}
        >
          <Close size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
