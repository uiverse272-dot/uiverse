"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useI18n } from "@/i18n/client";
import { plural } from "@/i18n/format";
import { LangSwitch } from "./LangSwitch";
import { SearchField } from "./SearchCommand";
import { startGuide } from "../guide/events";
import { ThemeToggle } from "./Theme";
import { Logo } from "./Sidebar";
import { useSaved } from "../save/SavedProvider";
import { Bookmark, Chevron, User } from "../ui/icons";

const MORE = [
  { href: "/3d", key: "threeD" },
  { href: "/creators", key: "creators" },
  { href: "/pricing", key: "pricing" },
  { href: "/upload", key: "upload" },
] as const;

/**
 * A row of ruled cells: search (the signal-yellow cell), more, profile, saved.
 * Primary navigation lives in the Sidebar rail on desktop and BottomNav on phones.
 */
export function Navbar() {
  const { lang, t } = useI18n();
  const { saves } = useSaved();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <header className="sticky top-0 z-[60] flex h-16 items-stretch border-b border-border bg-bg">
      <div className="w-16 shrink-0 border-e border-border md:hidden">
        <Logo />
      </div>

      <div className="flex min-w-0 flex-1 items-center bg-signal px-3 text-on-signal md:px-5">
        <div className="w-full max-w-[460px]">
          <SearchField />
        </div>
      </div>

      <LangSwitch className="hidden items-center border-s border-border px-5 text-[13px] transition-colors hover:bg-bg-subtle md:flex" />

      {/* from md: tablets have the rail but not 3D, Creators or Pricing — this menu is their only way in */}
      <div className="relative hidden border-s border-border md:block" ref={moreRef}>
        <button
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          className="flex h-full items-center gap-2 px-5 text-[13px] transition-colors hover:bg-bg-subtle"
        >
          {t.nav.more} <Chevron size={14} />
        </button>
        {moreOpen ? (
          <div className="anim-fade-in absolute end-0 top-[calc(100%+1px)] z-50 w-48 border border-border bg-surface shadow-[4px_4px_0_var(--border)]">
            {MORE.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setMoreOpen(false)}
                className="block border-b border-rule px-3.5 py-2.5 text-[13px] last:border-b-0 hover:bg-bg-subtle"
              >
                {t.nav[m.key]}
              </Link>
            ))}
            <button
              onClick={() => {
                setMoreOpen(false);
                startGuide();
              }}
              className="block w-full border-t border-border bg-signal/40 px-3.5 py-2.5 text-start text-[13px] font-medium hover:bg-signal"
            >
              {t.nav.takeGuide}
            </button>
          </div>
        ) : null}
      </div>

      <Link
        href="/u/me"
        className="hidden min-w-[220px] items-center gap-3 border-s border-border pe-5 transition-colors hover:bg-bg-subtle md:flex"
      >
        <span className="grid h-full w-16 shrink-0 place-items-center border-e border-border bg-surface">
          <span className="grid h-10 w-10 place-items-center border border-border bg-signal text-on-signal">
            <User size={20} />
          </span>
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13.5px] font-bold">{t.nav.guest}</span>
          <span className="block truncate text-[11px] text-text-2">
            {saves.length ? plural(t.nav.savedCount, saves.length, lang) : t.nav.seeker}
          </span>
        </span>
        <Chevron size={15} />
      </Link>

      <Link
        href="/saved"
        aria-label={t.nav.saved}
        className="relative hidden w-16 shrink-0 items-center justify-center border-s border-border transition-colors hover:bg-bg-subtle md:flex"
      >
        <Bookmark size={20} />
        {saves.length ? (
          <span className="absolute end-3 top-3.5 grid h-4 min-w-4 place-items-center border border-border bg-accent px-0.5 text-[9.5px] font-bold text-accent-fg tabular-nums">
            {saves.length > 99 ? "99+" : saves.length}
          </span>
        ) : null}
      </Link>

      <div className="w-14 shrink-0 border-s border-border md:hidden">
        <ThemeToggle />
      </div>
    </header>
  );
}
