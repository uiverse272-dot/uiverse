"use client";

import { useSaved } from "./SavedProvider";
import { Bookmark } from "../ui/icons";

export function SaveButton({
  slug,
  variant = "card",
}: {
  slug: string;
  variant?: "card" | "solid" | "inline";
}) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(slug);

  if (variant === "solid") {
    return (
      <button
        onClick={() => toggle(slug)}
        className={`inline-flex h-10 items-center gap-2 rounded-[8px] px-4 text-[14px] font-medium transition-colors ${
          saved
            ? "bg-surface text-text border border-border-strong"
            : "bg-accent text-accent-fg hover:opacity-90"
        }`}
      >
        <Bookmark size={15} filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        onClick={() => toggle(slug)}
        className="inline-flex items-center gap-1.5 text-[13px] text-text-2 hover:text-text transition-colors"
      >
        <Bookmark size={14} filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-label={saved ? "Remove from saves" : "Save"}
      className={`inline-flex h-8 items-center gap-1.5 rounded-[7px] px-2 text-[12.5px] font-medium backdrop-blur-md transition-all md:px-2.5 ${
        saved
          ? "bg-[rgb(255_255_255/0.92)] text-[#0a0a0a] dark:bg-[rgb(20_20_22/0.92)] dark:text-white"
          : "bg-[rgb(10_10_10/0.72)] text-white hover:bg-[rgb(10_10_10/0.88)]"
      }`}
    >
      <Bookmark size={13} filled={saved} />
      <span className="hidden md:inline">{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
