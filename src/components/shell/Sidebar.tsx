"use client";

import { Link, useI18n, useLocalPath } from "@/i18n/client";
import { ThemeToggle } from "./Theme";
import { Bookmark, Compass, Grid, Home, Layout, Monitor, Palette, Pen, Phone, Upload, User } from "../ui/icons";

const NAV = [
  { href: "/", key: "home", Icon: Home },
  { href: "/explore", key: "explore", Icon: Compass },
  { href: "/web", key: "web", Icon: Monitor },
  { href: "/apps", key: "apps", Icon: Phone },
  { href: "/components", key: "parts", Icon: Grid },
  { href: "/layouts", key: "layouts", Icon: Layout },
  { href: "/palettes", key: "palettes", Icon: Palette },
  { href: "/saved", key: "saved", Icon: Bookmark },
] as const;

const FOOT = [
  { href: "/sketch", key: "sketch", Icon: Pen },
  { href: "/upload", key: "upload", Icon: Upload },
  { href: "/u/me", key: "profile", Icon: User },
] as const;

/** The U cradling a planet: UI + universe. Same drawing as app/icon.svg. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={className}>
      <rect x="1" y="1" width="30" height="30" fill="var(--accent)" stroke="#1c1b18" strokeWidth="2" />
      <path d="M9 7v11a7 7 0 0 0 14 0V7" fill="none" stroke="#1c1b18" strokeWidth="4.5" strokeLinecap="square" />
      <circle cx="16" cy="17.5" r="3" fill="var(--signal)" stroke="#1c1b18" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo() {
  const { t } = useI18n();
  return (
    <Link
      href="/"
      aria-label={t.nav.logoHome}
      className="group grid h-16 shrink-0 place-items-center"
    >
      <LogoMark
        size={34}
        className="transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:drop-shadow-[2px_2px_0_var(--border)]"
      />
    </Link>
  );
}

/** Desktop rail. Phones get BottomNav instead. */
export function Sidebar() {
  const { t } = useI18n();
  const pathname = useLocalPath();
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside aria-label={t.nav.rail} className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col border-e border-border bg-bg md:flex">
      <div className="border-b border-border">
        <Logo />
      </div>
      {/* min-h-0 lets the list shrink and scroll rather than run under the footer; on short laptop
          screens (~730px) the rail tightens so all eight items fit without scrolling */}
      <nav aria-label={t.nav.label} className="scroll-x flex min-h-0 flex-1 flex-col items-stretch gap-1 overflow-y-auto py-4 [@media(max-height:820px)]:gap-0 [@media(max-height:820px)]:py-1">
        {NAV.map((n) => (
          <RailLink key={n.href} href={n.href} Icon={n.Icon} label={t.nav[n.key]} on={active(n.href)} />
        ))}
      </nav>
      <div className="flex flex-col gap-1 py-4 [@media(max-height:820px)]:gap-0 [@media(max-height:820px)]:py-1">
        {FOOT.map((n) => (
          <RailLink key={n.href} href={n.href} Icon={n.Icon} label={t.nav[n.key]} on={active(n.href)} />
        ))}
        <ThemeToggle rail />
      </div>
    </aside>
  );
}

function RailLink({
  href,
  label,
  Icon,
  on,
}: {
  href: string;
  label: string;
  Icon: (p: { size?: number }) => React.ReactNode;
  on: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={`flex flex-col items-center gap-1.5 py-2.5 text-[10.5px] transition-colors [@media(max-height:820px)]:gap-1 [@media(max-height:820px)]:py-1.5 ${
        on ? "text-accent-ink" : "text-text hover:text-accent-ink"
      }`}
    >
      <Icon size={21} />
      {label}
    </Link>
  );
}
