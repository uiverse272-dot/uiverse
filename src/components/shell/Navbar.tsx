"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SearchField } from "./SearchCommand";
import { ThemeToggle } from "./Theme";
import { Logo } from "./Sidebar";
import { useSaved } from "../save/SavedProvider";
import { Bookmark, Chevron, User } from "../ui/icons";

const MORE = [
  { href: "/3d", label: "3D" },
  { href: "/creators", label: "Creators" },
  { href: "/pricing", label: "Pricing" },
  { href: "/upload", label: "Upload" },
];

/**
 * A row of ruled cells: search (the signal-yellow cell), more, profile, saved.
 * Primary navigation lives in the Sidebar rail on desktop and BottomNav on phones.
 */
export function Navbar() {
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
      <div className="w-16 shrink-0 border-r border-border md:hidden">
        <Logo />
      </div>

      <div className="flex min-w-0 flex-1 items-center bg-signal px-3 text-on-signal md:px-5">
        <div className="w-full max-w-[460px]">
          <SearchField />
        </div>
      </div>

      <div className="relative hidden border-l border-border lg:block" ref={moreRef}>
        <button
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          className="flex h-full items-center gap-2 px-5 text-[13px] transition-colors hover:bg-bg-subtle"
        >
          More <Chevron size={14} />
        </button>
        {moreOpen ? (
          <div className="anim-fade-in absolute right-0 top-[calc(100%+1px)] z-50 w-48 border border-border bg-surface shadow-[4px_4px_0_var(--border)]">
            {MORE.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setMoreOpen(false)}
                className="block border-b border-rule px-3.5 py-2.5 text-[13px] last:border-b-0 hover:bg-bg-subtle"
              >
                {m.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <Link
        href="/u/me"
        className="hidden min-w-[220px] items-center gap-3 border-l border-border pr-5 transition-colors hover:bg-bg-subtle md:flex"
      >
        <span className="grid h-full w-16 shrink-0 place-items-center border-r border-border bg-surface">
          <span className="grid h-10 w-10 place-items-center border border-border bg-signal text-on-signal">
            <User size={20} />
          </span>
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13.5px] font-bold">Guest</span>
          <span className="block truncate text-[11px] text-text-2">
            {saves.length ? `${saves.length} saved` : "Interface seeker"}
          </span>
        </span>
        <Chevron size={15} />
      </Link>

      <Link
        href="/saved"
        aria-label="Saved"
        className="relative hidden w-16 shrink-0 items-center justify-center border-l border-border transition-colors hover:bg-bg-subtle md:flex"
      >
        <Bookmark size={20} />
        {saves.length ? (
          <span className="absolute right-3 top-3.5 grid h-4 min-w-4 place-items-center border border-border bg-accent px-0.5 text-[9.5px] font-bold text-accent-fg tabular-nums">
            {saves.length > 99 ? "99+" : saves.length}
          </span>
        ) : null}
      </Link>

      <div className="w-14 shrink-0 border-l border-border md:hidden">
        <ThemeToggle />
      </div>
    </header>
  );
}
