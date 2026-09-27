"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Chevron, Close, Filter } from "../ui/icons";

export type FilterDef = {
  param: string;
  label: string;
  options: readonly { slug: string; name: string }[];
};

/** All feed state lives in the URL — shareable, back-button correct, SSR-able. */
export function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const set = useCallback(
    (param: string, value?: string) => {
      const next = new URLSearchParams(sp.toString());
      if (!value || next.get(param) === value) next.delete(param);
      else next.set(param, value);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp],
  );

  const clear = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  return { get: (p: string) => sp.get(p) ?? undefined, set, clear, sp };
}

function Popover({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap border border-border px-2.5 text-[12.5px] transition-colors ${
          value ? "bg-accent text-accent-fg" : "hover:bg-bg-subtle"
        }`}
      >
        {value ?? label}
        <Chevron size={13} />
      </button>
      {open ? (
        <div className="anim-fade-in absolute left-0 top-9 z-50 max-h-[320px] w-56 overflow-auto border border-border bg-surface shadow-[4px_4px_0_var(--border)]">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

export function FilterBar({
  defs,
  sorts,
}: {
  defs: FilterDef[];
  sorts?: readonly { slug: string; name: string }[];
}) {
  const { get, set, clear } = useFilterState();
  const active = defs.filter((d) => get(d.param));
  const sort = get("sort");

  return (
    <div className="flex items-center gap-2 overflow-x-auto scroll-x py-2.5">
      <span className="hidden items-center gap-1.5 pr-1 text-[12.5px] md:inline-flex">
        <Filter size={14} />
      </span>

      {defs.map((d) => {
        const v = get(d.param);
        const label = d.options.find((o) => o.slug === v)?.name;
        return (
          <Popover key={d.param} label={d.label} value={label}>
            {(close) => (
              <>
                {d.options.map((o) => (
                  <button
                    key={o.slug}
                    onClick={() => {
                      set(d.param, o.slug);
                      close();
                    }}
                    className="flex w-full items-center justify-between border-b border-rule px-3 py-2 text-left text-[12.5px] last:border-b-0 hover:bg-bg-subtle"
                  >
                    {o.name}
                    {v === o.slug ? <Check size={13} /> : null}
                  </button>
                ))}
              </>
            )}
          </Popover>
        );
      })}

      <Toggle label="Code" on={get("code") === "true"} onClick={() => set("code", get("code") ? undefined : "true")} />

      {sorts ? (
        <div className="ml-auto flex items-center gap-2 pl-2">
          <Popover label="Trending" value={sorts.find((s) => s.slug === sort)?.name}>
            {(close) => (
              <>
                {sorts.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => {
                      set("sort", s.slug);
                      close();
                    }}
                    className="flex w-full items-center justify-between border-b border-rule px-3 py-2 text-left text-[12.5px] last:border-b-0 hover:bg-bg-subtle"
                  >
                    {s.name}
                    {sort === s.slug ? <Check size={13} /> : null}
                  </button>
                ))}
              </>
            )}
          </Popover>
        </div>
      ) : null}

      {active.length || get("code") ? (
        <button
          onClick={clear}
          className="link-ink inline-flex h-8 shrink-0 items-center gap-1 px-2 text-[12px]"
        >
          <Close size={13} /> Clear
        </button>
      ) : null}
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 shrink-0 whitespace-nowrap border border-border px-2.5 text-[12.5px] transition-colors ${
        on ? "bg-accent text-accent-fg" : "hover:bg-bg-subtle"
      }`}
    >
      {label}
    </button>
  );
}

export function ChipRail({
  chips,
  param = "chip",
}: {
  chips: { label: string; href?: string; param?: string; value?: string }[];
  param?: string;
}) {
  const { get, set } = useFilterState();
  return (
    <div className="flex items-center gap-2 overflow-x-auto scroll-x">
      {chips.map((c) => {
        const p = c.param ?? param;
        const on = c.value ? get(p) === c.value : !get(p) && c.label === "For You";
        return (
          <button
            key={c.label}
            onClick={() => set(p, c.value)}
            className={`h-8 shrink-0 whitespace-nowrap border border-border px-3 text-[12.5px] transition-colors ${
              on ? "bg-accent text-accent-fg" : "bg-surface hover:bg-bg-subtle"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
