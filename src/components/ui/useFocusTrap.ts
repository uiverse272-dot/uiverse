"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = ["a[href]", "button:not([disabled])", "input:not([disabled])", "textarea:not([disabled])", "[tabindex]"]
  .map((s) => `${s}:not([tabindex="-1"])`)
  .join(",");

/* open traps, innermost last — only the top one handles Tab (the prompt dialog opens inside the overlay) */
const stack: HTMLElement[] = [];

/**
 * Keeps keyboard focus inside a modal: focus moves in when it opens, Tab and Shift+Tab wrap at
 * either end instead of walking into the page behind, and focus returns to the opener on close.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const opener = document.activeElement as HTMLElement | null;
    const items = () =>
      [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);

    stack.push(root);
    (items()[0] ?? root).focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || stack[stack.length - 1] !== root) return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const at = document.activeElement;
      const outside = !root.contains(at);
      if (e.shiftKey && (at === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (at === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(root), 1);
      opener?.focus({ preventScroll: true });
    };
  }, [ref]);
}
