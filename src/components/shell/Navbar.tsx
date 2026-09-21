"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchField } from "./SearchCommand";
import { ThemeToggle } from "./Theme";
import { useSaved } from "../save/SavedProvider";
import { Bookmark, Chevron, Plus, User } from "../ui/icons";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/web", label: "Web" },
  { href: "/apps", label: "Apps" },
  { href: "/components", label: "Components" },
  { href: "/layouts", label: "Layouts" },
];

const MORE = [
  { href: "/palettes", label: "Palettes" },
  { href: "/3d", label: "3D" },
  { href: "/creators", label: "Creators" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();
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
    <header className="sticky top-0 z-[60] border-b border-border bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 md:gap-5 md:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-accent">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-accent-fg" />
          </span>
          <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:block">Uiverse</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative rounded-[7px] px-2.5 py-1.5 text-[13.5px] font-medium transition-colors ${
                  active ? "text-text" : "text-text-2 hover:text-text"
                }`}
              >
                {n.label}
                {active ? <span className="absolute inset-x-2.5 -bottom-[11px] h-[2px] rounded-full bg-text" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mx-auto w-full max-w-[520px] flex-1">
          <SearchField />
        </div>

        <div className="relative hidden lg:block" ref={moreRef}>
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className="inline-flex items-center gap-1 rounded-[7px] px-2 py-1.5 text-[13.5px] font-medium text-text-2 hover:text-text"
          >
            More <Chevron size={13} />
          </button>
          {moreOpen ? (
            <div className="anim-fade-in absolute right-0 top-9 z-50 w-44 rounded-[10px] border border-border bg-surface p-1 shadow-[0_8px_28px_rgb(0_0_0/0.12)]">
              {MORE.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setMoreOpen(false)}
                  className="block rounded-[7px] px-2.5 py-2 text-[13px] hover:bg-bg-subtle"
                >
                  {m.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/upload"
            className="hidden h-8 items-center gap-1.5 rounded-[7px] border border-border px-2.5 text-[13px] font-medium transition-colors hover:bg-bg-subtle md:inline-flex"
          >
            <Plus size={14} /> Upload
          </Link>
          <Link
            href="/saved"
            aria-label="Saved"
            className="relative hidden h-8 w-8 items-center justify-center rounded-[7px] text-text-2 transition-colors hover:bg-bg-subtle hover:text-text md:flex"
          >
            <Bookmark size={16} />
            {saves.length ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-fg tabular-nums">
                {saves.length > 99 ? "99+" : saves.length}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
          <Link
            href="/u/me"
            aria-label="Profile"
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-border text-text-2 transition-colors hover:text-text md:flex"
          >
            <User size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
