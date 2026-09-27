"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./Theme";
import { Bookmark, Compass, Grid, Home, Layout, Monitor, Palette, Phone, Upload, User } from "../ui/icons";

const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/web", label: "Web", Icon: Monitor },
  { href: "/apps", label: "Apps", Icon: Phone },
  { href: "/components", label: "Parts", Icon: Grid },
  { href: "/layouts", label: "Layouts", Icon: Layout },
  { href: "/palettes", label: "Palettes", Icon: Palette },
  { href: "/saved", label: "Saved", Icon: Bookmark },
];

const FOOT = [
  { href: "/upload", label: "Upload", Icon: Upload },
  { href: "/u/me", label: "Profile", Icon: User },
];

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
  return (
    <Link
      href="/"
      aria-label="Uiverse home"
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
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col border-r border-border bg-bg md:flex">
      <div className="border-b border-border">
        <Logo />
      </div>
      <nav className="scroll-x flex flex-1 flex-col items-stretch gap-1 overflow-y-auto py-4">
        {NAV.map((n) => (
          <RailLink key={n.href} {...n} on={active(n.href)} />
        ))}
      </nav>
      <div className="flex flex-col gap-1 py-4">
        {FOOT.map((n) => (
          <RailLink key={n.href} {...n} on={active(n.href)} />
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
      className={`flex flex-col items-center gap-1.5 py-2.5 text-[10.5px] transition-colors ${
        on ? "text-accent" : "text-text hover:text-accent"
      }`}
    >
      <Icon size={21} />
      {label}
    </Link>
  );
}
