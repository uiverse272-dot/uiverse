"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseQuery } from "@/lib/query";
import { Search } from "../ui/icons";

const EXAMPLES = [
  "dark fintech dashboard",
  "minimal saas pricing section",
  "luxury ecommerce landing page",
  "ios onboarding flow",
  "editorial blog layout",
];

export function SearchField({ big = false }: { big?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [ph, setPh] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!big) return;
    const t = setInterval(() => setPh((p) => (p + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(t);
  }, [big]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const parsed = parseQuery(q);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    ref.current?.blur();
    setFocused(false);
  };

  return (
    <div className={`relative ${big ? "w-full" : "w-full"}`}>
      <form onSubmit={submit}>
        <div
          className={`flex items-center gap-2.5 rounded-[10px] border bg-bg-subtle transition-colors ${
            focused ? "border-border-strong" : "border-border"
          } ${big ? "h-13 px-4" : "h-9 px-3"}`}
          style={big ? { height: 52 } : undefined}
        >
          <Search size={big ? 18 : 15} className="shrink-0 text-text-3" />
          <input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 140)}
            placeholder={big ? `Try: ${EXAMPLES[ph]}` : "Search designs, components, sources…"}
            className={`w-full bg-transparent outline-none placeholder:text-text-3 ${big ? "text-[16px]" : "text-[13.5px]"}`}
          />
          {!big ? (
            <kbd className="hidden shrink-0 rounded-[5px] border border-border px-1.5 py-0.5 font-mono text-[10.5px] text-text-3 lg:block">
              ⌘K
            </kbd>
          ) : null}
        </div>
      </form>

      {focused && q.trim() ? (
        <div className="anim-fade-in absolute inset-x-0 top-[calc(100%+6px)] z-[70] rounded-[12px] border border-border bg-surface p-2 shadow-[0_12px_40px_rgb(0_0_0/0.14)]">
          {parsed.terms.length ? (
            <div className="flex flex-wrap items-center gap-1.5 px-1.5 pb-2">
              <span className="text-[11.5px] text-text-3">Reading as</span>
              {parsed.terms.map((t) => (
                <span key={t.param} className="rounded-[6px] bg-bg-subtle px-1.5 py-1 text-[11.5px] font-medium">
                  {t.dimension}: {t.label}
                </span>
              ))}
            </div>
          ) : null}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
            className="flex w-full items-center gap-2.5 rounded-[8px] px-2 py-2 text-left text-[13.5px] hover:bg-bg-subtle"
          >
            <Search size={14} className="text-text-3" />
            Search for <span className="font-medium">“{q}”</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
