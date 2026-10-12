"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bookmark, Close, Compass, Dots, Grid, Home, Layout, Monitor, Palette, Phone, Search, Sparkle, Tag, Upload, User, Users,
} from "../ui/icons";
import { useFocusTrap } from "../ui/useFocusTrap";

/**
 * Upload is deliberately not a tab — it is <2% of sessions while search is the
 * most frequent action. See docs/10 §4.8. It lives in the More sheet with every
 * section that doesn't earn a tab, so nothing is reachable only by URL.
 */
const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/saved", label: "Saved", Icon: Bookmark },
];

const MORE = [
  { href: "/web", label: "Web", Icon: Monitor },
  { href: "/apps", label: "Apps", Icon: Phone },
  { href: "/components", label: "Parts", Icon: Grid },
  { href: "/layouts", label: "Layouts", Icon: Layout },
  { href: "/palettes", label: "Palettes", Icon: Palette },
  { href: "/3d", label: "3D", Icon: Sparkle },
  { href: "/creators", label: "Creators", Icon: Users },
  { href: "/u/me", label: "Profile", Icon: User },
  { href: "/upload", label: "Upload", Icon: Upload },
  { href: "/pricing", label: "Pricing", Icon: Tag },
];

const isOn = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreOn = MORE.some((m) => isOn(pathname, m.href));

  return (
    <>
      {open ? <MoreSheet pathname={pathname} onClose={() => setOpen(false)} /> : null}
      <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex h-14 items-stretch">
          {TABS.map(({ href, label, Icon }) => {
            const active = !open && isOn(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center justify-center gap-1 border-r border-rule text-[10px] transition-colors ${
                  active ? "text-accent-ink" : "text-text"
                }`}
              >
                <Icon size={19} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="dialog"
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors ${
              open || moreOn ? "text-accent-ink" : "text-text"
            }`}
          >
            <Dots size={19} />
            More
          </button>
        </div>
      </nav>
    </>
  );
}

function MoreSheet({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const sheet = useRef<HTMLDivElement>(null);
  useFocusTrap(sheet);

  /* following a link closes the sheet: the pathname it opened on is no longer current */
  const [openedOn] = useState(pathname);
  useEffect(() => {
    if (pathname !== openedOn) onClose();
  }, [pathname, openedOn, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    /* above the Pick of the week tab (z-70), below toasts (z-80); bottom-14 leaves the tab bar visible */
    <div className="fixed inset-x-0 bottom-14 top-0 z-[75] flex flex-col justify-end md:hidden">
      <button aria-hidden tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-[var(--overlay)]" />
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-label="More"
        className="anim-fade-up relative border-t border-border bg-bg pb-2"
      >
        <div className="flex items-center justify-between border-b border-border pl-4">
          <span className="text-[12px] font-bold uppercase tracking-[0.12em]">More</span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 place-items-center border-l border-border"
          >
            <Close size={16} />
          </button>
        </div>
        <div className="grid grid-cols-5">
          {MORE.map(({ href, label, Icon }) => {
            const on = isOn(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={on ? "page" : undefined}
                className={`flex flex-col items-center gap-1.5 border-b border-r border-rule py-4 text-[11px] [&:nth-child(5n)]:border-r-0 ${
                  on ? "text-accent-ink" : "text-text"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
