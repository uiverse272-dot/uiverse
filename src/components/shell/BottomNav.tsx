"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useI18n, useLocalPath } from "@/i18n/client";
import { LangSwitch } from "./LangSwitch";
import {
  Bookmark, Close, Compass, Dots, Grid, Home, ImageIcon, Layout, Monitor, Palette, Pen, Phone, Search, Sparkle, Tag, Upload, User,
} from "../ui/icons";
import { useFocusTrap } from "../ui/useFocusTrap";
import { startGuide } from "../guide/events";

/**
 * Upload is deliberately not a tab — it is <2% of sessions while search is the
 * most frequent action. See docs/10 §4.8. It lives in the More sheet with every
 * section that doesn't earn a tab, so nothing is reachable only by URL.
 */
const TABS = [
  { href: "/", key: "home", Icon: Home },
  { href: "/explore", key: "explore", Icon: Compass },
  { href: "/search", key: "search", Icon: Search },
  { href: "/saved", key: "saved", Icon: Bookmark },
] as const;

const MORE = [
  { href: "/web", key: "web", Icon: Monitor },
  { href: "/apps", key: "apps", Icon: Phone },
  { href: "/components", key: "parts", Icon: Grid },
  { href: "/layouts", key: "layouts", Icon: Layout },
  { href: "/palettes", key: "palettes", Icon: Palette },
  { href: "/finds", key: "finds", Icon: Sparkle },
  { href: "/3d", key: "threeD", Icon: Sparkle },
  { href: "/sketch", key: "sketch", Icon: Pen },
  { href: "/similar", key: "similar", Icon: ImageIcon },
  { href: "/u/me", key: "profile", Icon: User },
  { href: "/upload", key: "upload", Icon: Upload },
  { href: "/pricing", key: "pricing", Icon: Tag },
] as const;

const isOn = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function BottomNav() {
  const { t } = useI18n();
  const pathname = useLocalPath();
  const [open, setOpen] = useState(false);
  const moreOn = MORE.some((m) => isOn(pathname, m.href));

  return (
    <>
      {open ? <MoreSheet pathname={pathname} onClose={() => setOpen(false)} /> : null}
      <nav aria-label={t.nav.label} className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex h-14 items-stretch">
          {TABS.map(({ href, key, Icon }) => {
            const active = !open && isOn(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center justify-center gap-1 border-e border-rule text-[10px] transition-colors ${
                  active ? "text-accent-ink" : "text-text"
                }`}
              >
                <Icon size={19} />
                {t.nav[key]}
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
            {t.nav.more}
          </button>
        </div>
      </nav>
    </>
  );
}

function MoreSheet({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const { t } = useI18n();
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
        aria-label={t.nav.more}
        className="anim-fade-up relative border-t border-border bg-bg pb-2"
      >
        <div className="flex items-center justify-between border-b border-border ps-4">
          <span className="text-[12px] font-bold uppercase tracking-[0.12em]">{t.nav.more}</span>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="grid h-11 w-11 place-items-center border-s border-border"
          >
            <Close size={16} />
          </button>
        </div>
        <div className="grid grid-cols-5">
          {MORE.map(({ href, key, Icon }) => {
            const on = isOn(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={on ? "page" : undefined}
                className={`flex flex-col items-center gap-1.5 border-b border-e border-rule py-4 text-[11px] [&:nth-child(5n)]:border-e-0 ${
                  on ? "text-accent-ink" : "text-text"
                }`}
              >
                <Icon size={20} />
                {t.nav[key]}
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => {
            onClose();
            startGuide();
          }}
          className="mx-4 mt-3 flex h-11 w-[calc(100%-2rem)] items-center justify-center gap-2 border border-border bg-signal text-[13px] font-bold text-on-signal"
        >
          <Sparkle size={15} /> {t.nav.takeGuide}
        </button>
        <LangSwitch className="mx-4 mt-2 flex h-11 items-center justify-center border border-border text-[13px] font-bold" />
      </div>
    </div>
  );
}
