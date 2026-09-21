"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "../ui/icons";

export const THEME_SCRIPT = `try{var t=localStorage.getItem('uiv.theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`;

/* The <html data-theme> attribute is the source of truth; React just observes it. */
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}

const read = () =>
  document.documentElement.dataset.theme ??
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "light");

  const next = () => {
    const t = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("uiv.theme", t);
    } catch {}
  };

  return (
    <button
      onClick={next}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="flex h-8 w-8 items-center justify-center rounded-[7px] text-text-2 transition-colors hover:bg-bg-subtle hover:text-text"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
