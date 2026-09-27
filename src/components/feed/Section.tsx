import Link from "next/link";

export function PageHeader({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-1 pt-7">
      <div>
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.03em]">{title}</h1>
        {sub ? <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-text-2">{sub}</p> : null}
      </div>
      {right}
    </div>
  );
}

/** "Popular Books ........ more" — a bold mono label with an underlined link on the right. */
export function SectionHead({ title, href, more = "more" }: { title: string; href?: string; more?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 pb-3">
      <h2 className="text-[15px] font-bold">{title}</h2>
      {href ? (
        <Link href={href} className="link-ink text-[12px]">
          {more}
        </Link>
      ) : null}
    </div>
  );
}

export function Shell({ children, wide = true }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto px-4 md:px-6 ${wide ? "max-w-[2100px]" : "max-w-[1100px]"}`}>{children}</div>
  );
}

export function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-16 z-50 border-b border-border bg-bg">
      <div className="mx-auto max-w-[2100px] px-4 md:px-6">{children}</div>
    </div>
  );
}
