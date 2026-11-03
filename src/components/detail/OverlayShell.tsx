"use client";

import { useLayoutEffect, useRef } from "react";
import { flyToShell, leaveShell } from "../motion/morph";
import { lockScroll } from "../ui/scrollLock";

/**
 * The detail overlay while its content streams in: the same backdrop, sheet and frame, drawn
 * empty, so a click answers at once. A clicked card's picture flies into the frame and waits
 * there for the real view to take it over (motion/morph.ts).
 */
export function OverlayShell({ kind }: { kind: "screen" | "component" }) {
  const frame = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    flyToShell(frame.current);
    const unlock = lockScroll();
    return () => {
      unlock();
      leaveShell();
    };
  }, []);

  return (
    <div aria-busy="true" className="anim-fade-in fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[var(--overlay)] p-0 md:px-6 md:pb-6">
      <div className="relative w-full max-w-[1700px] border border-border bg-bg md:mt-6 md:shadow-[6px_6px_0_var(--border)]">
        <div className="h-12 border-b border-border" />
        <div className="mx-auto grid max-w-[1700px] gap-6 px-4 pt-5 md:px-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="flex items-center pb-3">
              <span className="h-[30px] w-[190px] border border-border" />
            </div>
            <div className="flex justify-center border border-border bg-bg-subtle p-3 md:p-5">
              <div ref={frame} className="w-full border border-border bg-bg" style={{ height: kind === "screen" ? "min(76vh, 900px)" : 520 }} />
            </div>
          </div>
          <div className="hidden gap-3 lg:grid lg:content-start">
            <span className="h-6 w-3/4 bg-bg-subtle" />
            <span className="h-4 w-1/2 bg-bg-subtle" />
            <span className="mt-3 h-11 border border-border" />
            <span className="h-11 bg-bg-subtle" />
          </div>
        </div>
      </div>
    </div>
  );
}
