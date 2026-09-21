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
        <h1 className="text-[26px] font-semibold tracking-[-0.025em]">{title}</h1>
        {sub ? <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-text-2">{sub}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Shell({ children, wide = true }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto px-4 md:px-5 ${wide ? "max-w-[2100px]" : "max-w-[1100px]"}`}>{children}</div>
  );
}

export function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-14 z-50 border-b border-border bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto max-w-[2100px] px-4 md:px-5">{children}</div>
    </div>
  );
}
