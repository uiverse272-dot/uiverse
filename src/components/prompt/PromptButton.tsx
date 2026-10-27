"use client";

import { useState } from "react";
import type { Item } from "@/lib/data";
import type { PromptOptions } from "@/lib/prompt";
import { Sparkle } from "../ui/icons";
import { PromptDialog } from "./PromptDialog";

/** Opens the prompt generator from a server-rendered page — a layout card, a palette card. */
export function PromptButton({
  item,
  label,
  title,
  defaults,
  className = "",
}: {
  item: Item;
  label: string;
  title?: string;
  defaults?: Partial<PromptOptions>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 border border-border px-2 py-1.5 text-[12.5px] font-medium hover:bg-bg-subtle ${className}`}
      >
        <Sparkle size={13} />
        {label}
      </button>
      {open ? (
        <PromptDialog item={item} title={title} defaults={defaults} saveable={false} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
