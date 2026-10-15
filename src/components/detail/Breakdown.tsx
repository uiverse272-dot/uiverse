"use client";

import { Link, useI18n } from "@/i18n/client";
import { blockLabel, layoutValue, typeName, typeUse } from "@/i18n/content";
import { fill, plural } from "@/i18n/format";
import type { Item } from "@/lib/data";
import { CopyValue } from "./CopyValue";
import { colorRoles, fonts, layoutSpec, spacingScale, typeScale } from "@/lib/spec";
import { COMPONENT_TYPES } from "@/lib/taxonomy";

const BROWSABLE = new Set<string>(COMPONENT_TYPES.map((c) => c.slug));

/**
 * The Breakdown is the "Understand" step of the journey, and the reason this is
 * a tool rather than a gallery. Everything here is derived from the capture:
 * section order, colour roles, type scale, spacing rhythm.
 */

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3 pb-4">
        <h3 className="text-[14px] font-semibold tracking-[-0.015em]">{title}</h3>
        {note ? <span className="text-[11.5px] text-text-3">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function Breakdown({ item }: { item: Item }) {
  const { lang, t } = useI18n();
  const b = t.breakdown;
  const p = item.palette;
  const roles = colorRoles(item);
  const scale = typeScale(item);
  const layout = layoutSpec(item);
  const space = spacingScale(item);
  const font = fonts(item);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={b.outline} note={plural(b.blocks, item.blocks.length, lang)}>
        <ol className="space-y-1">
          {item.blocks.map((blk, i) => (
            <li key={`${blk.type}-${i}`}>
              <Link
                href={BROWSABLE.has(blk.type) ? `/components?component=${blk.type}` : `/search?q=${blk.type}`}
                className="flex items-center gap-3 px-2 py-2 transition-colors hover:bg-bg-subtle"
              >
                <span className="w-5 shrink-0 font-mono text-[11px] text-text-3 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-6 w-10 shrink-0 border border-border"
                  style={{ background: i === 0 ? p.surface : i % 3 === 1 ? p.raised : p.bg }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{blockLabel(blk.label, blk.type, lang)}</span>
                  {blk.heading ? (
                    <span dir="auto" className="block truncate text-[11.5px] text-text-3">
                      {blk.heading}
                    </span>
                  ) : null}
                </span>
                <span dir="ltr" className="shrink-0 font-mono text-[11px] text-text-3">{blk.type}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title={b.derived} note={b.derivedNote}>
        <div className="space-y-1.5">
          {item.blocks.map((blk, i) => (
            <div
              key={`${blk.type}-${i}`}
              className="flex items-center justify-center border border-dashed border-border text-[11.5px] text-text-2"
              style={{ height: 22 + (blk.type === "hero" ? 36 : blk.type === "footer" ? 18 : 10) }}
            >
              {blockLabel(blk.label, blk.type, lang)}
            </div>
          ))}
        </div>
        <Link
          href="/layouts"
          className="mt-4 inline-flex text-[12.5px] font-medium text-text-2 underline-offset-4 hover:text-text hover:underline"
        >
          {b.saveLayout} {t.common.arrow}
        </Link>
      </Panel>

      <Panel title={b.roles} note={b.rolesNote}>
        <div className="space-y-1">
          {roles.map(({ key, token, label, value: hex }) => {
            return (
              <div key={token} className="flex items-center gap-3 px-1 py-1.5">
                <span
                  className="h-7 w-7 shrink-0 border border-border"
                  style={{ background: hex }}
                />
                <span className="flex-1 text-[12.5px]">{t.roles[key] ?? label}</span>
                <CopyValue value={hex} />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <CopyValue
            mono={false}
            label={b.copyCss}
            value={roles.map((r) => `  --${r.token}: ${r.value};`).join("\n")}
            className="border border-border"
          />
          <CopyValue
            mono={false}
            label={b.copyTailwind}
            value={`@theme {\n${roles.map((r) => `  --color-${r.token}: ${r.value};`).join("\n")}\n}`}
            className="border border-border"
          />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title={b.type}>
          <div className="space-y-2.5">
            {scale.map(({ name: label, size, weight, use, sample }) => (
              <div key={label} className="flex items-baseline gap-3">
                <span className="w-16 shrink-0 text-[11.5px] text-text-3">{typeName(label, lang)}</span>
                <span
                  dir="auto"
                  title={typeUse(use, lang)}
                  className="flex-1 truncate"
                  style={{ fontSize: Math.min(size, 26), fontWeight: weight, letterSpacing: "-0.02em" }}
                >
                  {sample || typeUse(use, lang)}
                </span>
                <CopyValue value={`${size}px / ${weight}`} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={b.spacing} note={`${fill(b.base, { n: space.base })}${item.capture ? b.mostUsed : ""}`}>
          <div className="flex flex-wrap items-end gap-2">
            {space.values.map((s) => (
              <div key={s} className="flex flex-col items-center gap-1.5">
                <div className="bg-text/15" style={{ width: Math.min(s, 40), height: 26 }} />
                <span className="font-mono text-[10.5px] text-text-3">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 text-[12.5px]">
            <Row label={b.rows.radius} value={layout.radius} />
            <Row label={b.rows.grid} value={`${layoutValue(layout.columns, lang)}${lang === "ar" ? "، " : ", "}${layoutValue(layout.gutter, lang)}`} />
            <Row label={b.rows.body} value={layout.body} />
            <Row label={b.rows.container} value={layout.container} />
            {font ? <Row label={b.rows.headings} value={font.heading} /> : null}
            {font ? <Row label={b.rows.bodyFont} value={font.body} /> : null}
            {item.capture ? <Row label={b.rows.direction} value={item.capture.dir.toUpperCase()} /> : null}
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
      <bdi className="font-mono text-[11.5px]">{value}</bdi>
    </div>
  );
}
