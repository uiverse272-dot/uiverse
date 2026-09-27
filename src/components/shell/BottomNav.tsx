"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Home, Search, User } from "../ui/icons";

/**
 * Upload is deliberately not here — it is <2% of sessions while search is the
 * most frequent action. See docs/10 §4.8.
 */
const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/saved", label: "Saved", Icon: Bookmark },
  { href: "/u/me", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-14 items-stretch">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 border-r border-rule text-[10px] transition-colors last:border-r-0 ${
                active ? "text-accent" : "text-text"
              }`}
            >
              <Icon size={19} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
