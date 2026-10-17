"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, useLocalRouter } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { parseTerms, type Present } from "@/lib/parse";
import { Search } from "../ui/icons";

/** `initial` seeds the field — the results page passes its query so it can be refined in place. */
export function SearchField({ big = false, initial = "", present }: { big?: boolean; initial?: string; present: Present }) {
  const { lang, t } = useI18n();
  const router = useLocalRouter();
  const EXAMPLES = t.search.examples;
  const [q, setQ] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [ph, setPh] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!big) return;
    const tick = setInterval(() => setPh((p) => (p + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(tick);
  }, [big, EXAMPLES.length]);

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

  const parsed = parseTerms(q, lang, present);

  /* the header field is a launcher: it empties after a search, so it can't go stale while the
     results page's own field (seeded with the query) gets refined */
  const go = () => {
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    if (!big) setQ("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    go();
    ref.current?.blur();
    setFocused(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={submit}>
        <div
          className={`flex items-center gap-2.5 border transition-colors ${
            big ? "border-border bg-surface px-4" : "h-10 border-on-signal px-3 text-on-signal"
          } ${focused ? "shadow-[3px_3px_0_currentColor]" : ""}`}
          style={big ? { height: 52 } : undefined}
        >
          <Search size={big ? 19 : 18} className="shrink-0" />
          <input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 140)}
            placeholder={big ? fill(t.search.tryPrefix, { q: EXAMPLES[ph % EXAMPLES.length] }) : t.search.placeholder}
            className={`w-full bg-transparent outline-none ${
              big ? "text-[15px] placeholder:text-text-3" : "text-[13px] placeholder:text-on-signal/70"
            }`}
          />
          {!big ? (
            <kbd dir="ltr" className="hidden shrink-0 border border-current px-1.5 py-0.5 text-[10.5px] lg:block">
              ⌘K
            </kbd>
          ) : null}
        </div>
      </form>

      {focused && q.trim() ? (
        <div className="anim-fade-in absolute inset-x-0 top-[calc(100%+6px)] z-[70] border border-border bg-surface p-2 text-text shadow-[4px_4px_0_var(--border)]">
          {parsed.terms.length ? (
            <div className="flex flex-wrap items-center gap-1.5 px-1.5 pb-2">
              <span className="text-[11.5px] text-text-3">{t.search.readingAs}</span>
              {parsed.terms.map((term) => (
                <span key={term.param} className="border border-border bg-signal px-1.5 py-0.5 text-[11px] text-on-signal">
                  {t.search.dimensions[term.param]}: {term.label}
                </span>
              ))}
            </div>
          ) : null}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              go();
            }}
            className="flex w-full items-center gap-2.5 px-2 py-2 text-start text-[13px] hover:bg-bg-subtle"
          >
            <Search size={14} className="text-text-3" />
            {t.search.searchFor} <bdi className="font-bold">“{q}”</bdi>
          </button>
        </div>
      ) : null}
    </div>
  );
}
