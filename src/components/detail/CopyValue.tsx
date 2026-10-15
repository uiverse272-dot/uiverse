"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";
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
  const { t } = useI18n();
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
      className={`group inline-flex items-center gap-1.5 px-1.5 py-1 text-start transition-colors hover:bg-bg-subtle ${
        mono ? "font-mono text-[11.5px]" : "text-[12.5px]"
      } ${className}`}
      title={done ? t.common.copied : t.common.copy}
    >
      {/* a value (#1c1b18, 15px / 430) reads left to right; a label follows the page */}
      <span dir={label ? undefined : "ltr"} className="truncate">{label ?? value}</span>
      <span className="shrink-0 text-text-3 opacity-0 transition-opacity group-hover:opacity-100">
        {done ? <Check size={12} /> : <Copy size={12} />}
      </span>
    </button>
  );
}
