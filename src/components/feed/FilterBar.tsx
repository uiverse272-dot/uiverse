"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n, useLocalPath, useLocalRouter } from "@/i18n/client";
import { fromStart } from "../ui/fromStart";
import { Check, Chevron, Close, Filter } from "../ui/icons";

export type FilterDef = {
  param: string;
  label: string;
  options: readonly { slug: string; name: string }[];
};

/** All feed state lives in the URL — shareable, back-button correct, SSR-able. */
export function useFilterState() {
  const router = useLocalRouter();
  const pathname = useLocalPath();
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
  const button = useRef<HTMLButtonElement>(null);
  const [at, setAt] = useState<{ top: number; start: number; maxH: number } | null>(null);

  /*
   * The bar scrolls sideways (overflow-x), and that clips anything that hangs below it, so the
   * list is placed against the window instead — under its button, on the reading-start side,
   * kept on screen, and following the button when the bar or the page scrolls.
   */
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = button.current!.getBoundingClientRect();
      setAt({
        top: r.bottom + 4,
        start: Math.max(8, Math.min(fromStart(r), innerWidth - 224 - 8)),
        maxH: Math.min(320, innerHeight - r.bottom - 12),
      });
    };
    place();
    addEventListener("scroll", place, { capture: true, passive: true });
    addEventListener("resize", place);
    return () => {
      removeEventListener("scroll", place, { capture: true });
      removeEventListener("resize", place);
    };
  }, [open]);

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
        ref={button}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap border border-border px-2.5 text-[12.5px] transition-colors ${
          value ? "bg-accent text-accent-fg" : "hover:bg-bg-subtle"
        }`}
      >
        {value ?? label}
        <Chevron size={13} />
      </button>
      {open && at ? (
        <div
          className="anim-fade-in fixed z-[65] w-56 overflow-auto border border-border bg-surface shadow-[4px_4px_0_var(--border)]"
          style={{ top: at.top, insetInlineStart: at.start, maxHeight: at.maxH }}
        >
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
  const { t } = useI18n();
  const { get, set, clear } = useFilterState();
  const active = defs.filter((d) => get(d.param));
  const sort = get("sort");

  return (
    <div className="flex items-center gap-2 overflow-x-auto scroll-x py-2.5">
      <span className="hidden items-center gap-1.5 pe-1 text-[12.5px] md:inline-flex" title={t.filters.label}>
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
                    className="flex w-full items-center justify-between border-b border-rule px-3 py-2 text-start text-[12.5px] last:border-b-0 hover:bg-bg-subtle"
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

      <Toggle label={t.filters.code} on={get("code") === "true"} onClick={() => set("code", get("code") ? undefined : "true")} />
      <Toggle label={t.filters.rtl} on={get("dir") === "rtl"} onClick={() => set("dir", get("dir") ? undefined : "rtl")} />

      {sorts ? (
        <div className="ms-auto flex items-center gap-2 ps-2">
          <Popover label={t.filters.trending} value={sorts.find((s) => s.slug === sort)?.name}>
            {(close) => (
              <>
                {sorts.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => {
                      set("sort", s.slug);
                      close();
                    }}
                    className="flex w-full items-center justify-between border-b border-rule px-3 py-2 text-start text-[12.5px] last:border-b-0 hover:bg-bg-subtle"
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

      {active.length || get("code") || get("dir") ? (
        <button
          onClick={clear}
          className="link-ink inline-flex h-8 shrink-0 items-center gap-1 px-2 text-[12px]"
        >
          <Close size={13} /> {t.common.clear}
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
        /* the chip without a value is the default: selected when the URL names none */
        const on = c.value ? get(p) === c.value : !get(p);
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
