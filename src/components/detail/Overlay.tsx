"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Close } from "../ui/icons";

/**
 * Detail opens over a live feed. The URL is real and shareable; a cold hit on the
 * same URL renders the standalone page. Closing returns to the feed with scroll,
 * loaded pages and momentum untouched. See docs/02 §4.
 */
export function Overlay({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto overscroll-contain bg-[var(--overlay)] p-0 backdrop-blur-[2px] md:p-6">
      <button
        aria-label="Close"
        onClick={() => router.back()}
        className="fixed inset-0 -z-10 cursor-default"
      />
      <div className="anim-sheet relative w-full max-w-[1700px] rounded-none border border-border bg-bg md:rounded-[16px]">
        <button
          onClick={() => router.back()}
          className="sticky right-0 top-0 z-10 float-right m-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-2 transition-colors hover:text-text"
          aria-label="Close"
        >
          <Close size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
