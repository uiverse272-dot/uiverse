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

export function ThemeToggle({ rail = false }: { rail?: boolean }) {
  const theme = useSyncExternalStore(subscribe, read, () => "light");

  const next = () => {
    const t = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("uiv.theme", t);
    } catch {}
  };

  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  if (rail) {
    return (
      <button
        onClick={next}
        aria-label={label}
        className="flex flex-col items-center gap-1.5 py-2.5 text-[10.5px] text-text transition-colors hover:text-accent"
      >
        {theme === "dark" ? <Sun size={21} /> : <Moon size={21} />}
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    );
  }

  return (
    <button
      onClick={next}
      aria-label={label}
      className="flex h-full w-full items-center justify-center text-text transition-colors hover:bg-bg-subtle"
    >
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
