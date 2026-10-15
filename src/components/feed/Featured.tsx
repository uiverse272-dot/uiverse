"use client";

import { useEffect, useState } from "react";
import { Link, useI18n } from "@/i18n/client";
import { itemTitle, sourceAbout } from "@/i18n/content";
import { compactNum, timeAgo } from "@/i18n/format";
import type { Item } from "@/lib/data";
import { name, CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES } from "@/lib/taxonomy";
import { MockScreen } from "../mock/MockScreen";
import { SaveButton } from "../save/SaveButton";
import { useSaved } from "../save/SavedProvider";
import { Chevron, Close, Sparkle } from "../ui/icons";

type Mode = "tab" | "card" | "open";

/**
 * Pick of the week, floating over the home feed instead of taking a column.
 * It waits as a small tab, opens into a compact card and then the full record,
 * and folds back down to the tab.
 */
export function Featured({ item }: { item: Item }) {
  const { lang, t } = useI18n();
  const { isSaved } = useSaved();
  /* starts folded and stays that way until asked: unfolding by itself, it covered the feed's
     save buttons a moment after the page loaded */
  const [mode, setMode] = useState<Mode>("tab");

  useEffect(() => {
    if (mode !== "open") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMode("card");
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode]);

  const fold = () => setMode("tab");
  const unfold = () => setMode("card");

  const href = `/screen/${item.slug}`;

  if (mode === "tab") {
    return (
      <button
        onClick={unfold}
        className="anim-fade-up fixed bottom-20 end-4 z-[70] flex items-center gap-2 border border-border bg-signal px-3 py-2 text-[12px] font-bold text-on-signal shadow-[3px_3px_0_var(--border)] transition-transform hover:-translate-y-0.5 md:bottom-6 md:end-6"
      >
        <Sparkle size={14} /> {t.featured.pick}
      </button>
    );
  }

  const r = t.featured.rows;
  const rows: [string, string][] = [
    [r.saves, compactNum(item.saves + (isSaved(item.slug) ? 1 : 0), lang)],
    [r.type, name(CATEGORIES, item.category, lang)],
    [r.industry, name(INDUSTRIES, item.industry, lang)],
    [r.style, name(STYLES, item.style, lang)],
    [r.stack, item.tech.map((x) => name(TECHNOLOGIES, x)).join(", ")],
    [r.captured, timeAgo(item.daysAgo, lang)],
  ];
  const open = mode === "open";

  return (
    <aside
      aria-label={t.featured.pick}
      className="anim-sheet fixed bottom-20 end-4 z-[70] w-[min(340px,calc(100vw-32px))] border border-border bg-surface shadow-[5px_5px_0_var(--border)] md:bottom-6 md:end-6"
    >
      <div className="flex items-center justify-between border-b border-border bg-signal ps-3 text-on-signal">
        <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em]">
          <Sparkle size={13} /> {t.featured.pick}
        </span>
        <span className="flex">
          <button
            onClick={() => setMode(open ? "card" : "open")}
            aria-expanded={open}
            aria-label={open ? t.featured.showLess : t.featured.showDetails}
            className="grid h-8 w-8 place-items-center border-s border-on-signal/40 hover:bg-black/10"
          >
            <Chevron size={15} className={open ? "" : "rotate-180"} />
          </button>
          <button
            onClick={fold}
            aria-label={t.featured.hide}
            className="grid h-8 w-8 place-items-center border-s border-on-signal/40 hover:bg-black/10"
          >
            <Close size={14} />
          </button>
        </span>
      </div>

      <div className="flex gap-3 p-3">
        <Link href={href} className="block w-[68px] shrink-0 border border-border bg-bg p-0.5">
          <div className="overflow-hidden border border-border">
            <MockScreen item={{ ...item, aspect: 3 / 4 }} />
          </div>
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={href} className="truncate text-[14px] font-bold leading-snug hover:text-accent-ink">
            {itemTitle(item, lang)}
          </Link>
          <div className="mt-1 truncate text-[11.5px]">
            {t.common.by}{" "}
            <Link href={`/source/${item.source.slug}`} className="link-ink">
              {item.source.name}
            </Link>
          </div>
          <div className="truncate text-[11.5px] text-text-2">{item.source.domain}</div>
          <div className="mt-auto flex items-center gap-2 pt-2">
            <Link
              href={href}
              className="flex h-8 flex-1 items-center justify-center border border-border bg-accent text-[12px] text-accent-fg hover:brightness-105"
            >
              {t.featured.openBreakdown}
            </Link>
            <span className="grid h-8 w-8 place-items-center border border-border">
              <SaveButton slug={item.slug} variant="icon" />
            </span>
          </div>
        </div>
      </div>

      {open ? (
        <div className="anim-fade-in max-h-[45vh] overflow-y-auto border-t border-border px-3 pb-4 pt-3">
          <dl className="space-y-2 border-b border-rule pb-3">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 text-[11.5px]">
                <dt className="text-text-2">{k}</dt>
                <dd className="truncate">{v || "—"}</dd>
              </div>
            ))}
          </dl>
          <p dir="auto" className="mt-3 text-[12px] leading-[1.7]">{sourceAbout(item.source, lang)}</p>
        </div>
      ) : null}
    </aside>
  );
}
