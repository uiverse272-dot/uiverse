"use client";

import { useState } from "react";
import { Check, Copy } from "../ui/icons";

export function CopyValue({
  value,
  label,
  mono = true,
  className = "",
}: {
  value: string;
  label?: string;
  mono?: boolean;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1200);
          },
          () => {},
        );
      }}
      className={`group inline-flex items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-left transition-colors hover:bg-bg-subtle ${
        mono ? "font-mono text-[11.5px]" : "text-[12.5px]"
      } ${className}`}
      title="Copy"
    >
      <span className="truncate">{label ?? value}</span>
      <span className="shrink-0 text-text-3 opacity-0 transition-opacity group-hover:opacity-100">
        {done ? <Check size={12} /> : <Copy size={12} />}
      </span>
    </button>
  );
}
