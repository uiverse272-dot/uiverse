"use client";

import { useI18n } from "@/i18n/client";
import { useSaved } from "./SavedProvider";
import { Bookmark } from "../ui/icons";

export function SaveButton({
  slug,
  variant = "icon",
}: {
  slug: string;
  variant?: "icon" | "solid" | "inline";
}) {
  const { t } = useI18n();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(slug);

  if (variant === "solid") {
    return (
      <button
        onClick={() => toggle(slug)}
        data-guide="save"
        className={`inline-flex h-11 items-center justify-center gap-2 border border-border px-4 text-[13.5px] transition-colors ${
          saved ? "bg-surface text-text hover:bg-bg-subtle" : "bg-accent text-accent-fg hover:brightness-105"
        }`}
      >
        <Bookmark size={15} filled={saved} />
        {saved ? t.save.saved : t.save.save}
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
        {saved ? t.save.saved : t.save.save}
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
      aria-label={saved ? t.save.remove : t.save.save}
      aria-pressed={saved}
      className={`flex h-7 w-7 items-center justify-center transition-colors ${
        saved ? "text-accent-ink" : "text-text hover:text-accent-ink"
      }`}
    >
      <Bookmark size={17} filled={saved} />
    </button>
  );
}
