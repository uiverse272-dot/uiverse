"use client";

import Link from "next/link";
import type { Item } from "@/lib/data";
import { CopyValue } from "./CopyValue";

/**
 * The Breakdown is the "Understand" step of the journey, and the reason this is
 * a tool rather than a gallery. Everything here is derived from the capture:
 * section order, colour roles, type scale, spacing rhythm.
 */

const ROLE_ORDER: [keyof Item["palette"], string][] = [
  ["bg", "Background"],
  ["surface", "Surface"],
  ["raised", "Raised"],
  ["border", "Border"],
  ["text", "Text"],
  ["muted", "Text muted"],
  ["accent", "Accent"],
  ["accentFg", "Accent foreground"],
];

const TYPE_SCALE = [
  ["Display", 68, 600, "Hero headline"],
  ["H1", 48, 600, "Section header"],
  ["H2", 38, 600, "Sub-section"],
  ["H3", 22, 560, "Card title"],
  ["Body", 15, 430, "Paragraph"],
  ["Small", 13, 450, "Meta, labels"],
  ["Caption", 11.5, 500, "Eyebrow, badges"],
] as const;

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96];

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3 pb-4">
        <h3 className="text-[14px] font-semibold tracking-[-0.015em]">{title}</h3>
        {note ? <span className="text-[11.5px] text-text-3">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function Breakdown({ item }: { item: Item }) {
  const p = item.palette;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Section outline" note={`${item.blocks.length} blocks detected`}>
        <ol className="space-y-1">
          {item.blocks.map((b, i) => (
            <li key={`${b.type}-${i}`}>
              <Link
                href={`/components?component=${b.type}`}
                className="flex items-center gap-3 rounded-[8px] px-2 py-2 transition-colors hover:bg-bg-subtle"
              >
                <span className="w-5 shrink-0 font-mono text-[11px] text-text-3 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-6 w-10 shrink-0 rounded-[4px] border border-border"
                  style={{ background: i === 0 ? p.surface : i % 3 === 1 ? p.raised : p.bg }}
                />
                <span className="flex-1 truncate text-[13px] font-medium">{b.label}</span>
                <span className="shrink-0 font-mono text-[11px] text-text-3">{b.type}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Derived layout" note="the page as a reusable structure">
        <div className="space-y-1.5">
          {item.blocks.map((b, i) => (
            <div
              key={`${b.type}-${i}`}
              className="flex items-center justify-center rounded-[6px] border border-dashed border-border text-[11.5px] text-text-2"
              style={{ height: 22 + (b.type === "hero" ? 36 : b.type === "footer" ? 18 : 10) }}
            >
              {b.label}
            </div>
          ))}
        </div>
        <Link
          href="/layouts"
          className="mt-4 inline-flex text-[12.5px] font-medium text-text-2 underline-offset-4 hover:text-text hover:underline"
        >
          Save as a layout →
        </Link>
      </Panel>

      <Panel title="Colour roles" note="extracted from computed styles">
        <div className="space-y-1">
          {ROLE_ORDER.map(([key, label]) => {
            const hex = p[key] as string;
            return (
              <div key={key} className="flex items-center gap-3 rounded-[8px] px-1 py-1.5">
                <span
                  className="h-7 w-7 shrink-0 rounded-[6px] border border-border"
                  style={{ background: hex }}
                />
                <span className="flex-1 text-[12.5px]">{label}</span>
                <CopyValue value={hex} />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <CopyValue
            mono={false}
            label="Copy as CSS variables"
            value={ROLE_ORDER.map(([k, l]) => `  --${l.toLowerCase().replace(/ /g, "-")}: ${p[k]};`).join("\n")}
            className="border border-border"
          />
          <CopyValue
            mono={false}
            label="Copy as Tailwind theme"
            value={`@theme {\n${ROLE_ORDER.map(([k, l]) => `  --color-${l.toLowerCase().replace(/ /g, "-")}: ${p[k]};`).join("\n")}\n}`}
            className="border border-border"
          />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title="Type scale">
          <div className="space-y-2.5">
            {TYPE_SCALE.map(([label, size, weight, use]) => (
              <div key={label} className="flex items-baseline gap-3">
                <span className="w-16 shrink-0 text-[11.5px] text-text-3">{label}</span>
                <span
                  className="flex-1 truncate"
                  style={{ fontSize: Math.min(size, 26), fontWeight: weight, letterSpacing: "-0.02em" }}
                >
                  {use}
                </span>
                <CopyValue value={`${size}px / ${weight}`} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Spacing rhythm" note="4px base">
          <div className="flex flex-wrap items-end gap-2">
            {SPACING.map((s) => (
              <div key={s} className="flex flex-col items-center gap-1.5">
                <div className="rounded-[3px] bg-text/15" style={{ width: Math.min(s, 40), height: 26 }} />
                <span className="font-mono text-[10.5px] text-text-3">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 text-[12.5px]">
            <Row label="Radius" value={item.device === "mobile" ? "14 / 20px" : "8 / 12 / 16px"} />
            <Row label="Grid" value={item.device === "mobile" ? "1 col, 22px gutter" : "12 col, 1440 max"} />
            <Row label="Body" value="15px / 1.55" />
            <Row label="Container" value={item.device === "mobile" ? "390px" : "1440px"} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-text-3">{label}</span>
      <span className="font-mono text-[11.5px]">{value}</span>
    </div>
  );
}
