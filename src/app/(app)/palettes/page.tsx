import Link from "next/link";
import { PALETTE_ITEMS, compact } from "@/lib/data";
import { CopyValue } from "@/components/detail/CopyValue";
import { PageHeader, Shell } from "@/components/feed/Section";

export default function PalettesPage() {
  return (
    <Shell>
      <PageHeader
        title="Palettes"
        sub="Extracted from captures, with roles already assigned. Nothing here was hand-authored — it is a by-product of indexing screens."
      />
      <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PALETTE_ITEMS.map((p) => {
          const swatches: [string, string][] = [
            ["bg", p.palette.bg],
            ["surface", p.palette.surface],
            ["raised", p.palette.raised],
            ["accent", p.palette.accent],
            ["text", p.palette.text],
          ];
          return (
            <div key={p.slug} className="overflow-hidden rounded-[12px] border border-border bg-surface">
              <div className="flex h-28">
                {swatches.map(([role, hex]) => (
                  <div key={role} className="flex-1" style={{ background: hex }} />
                ))}
              </div>
              <div className="p-3.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[14px] font-semibold">{p.palette.name}</h3>
                  <span className="text-[11.5px] text-text-3 tabular-nums">{compact(p.saves)}</span>
                </div>
                <Link
                  href={`/source/${p.source.slug}`}
                  className="mt-1 block text-[12px] text-text-3 hover:text-text"
                >
                  from {p.source.name}
                </Link>
                <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-border pt-3">
                  {swatches.map(([role, hex]) => (
                    <div key={role} className="flex items-center gap-1.5">
                      <span className="h-3 w-3 shrink-0 rounded-[3px] border border-border" style={{ background: hex }} />
                      <CopyValue value={hex} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-1.5">
                  <CopyValue
                    mono={false}
                    label="CSS vars"
                    value={swatches.map(([r, h]) => `  --${r}: ${h};`).join("\n")}
                    className="flex-1 justify-center border border-border"
                  />
                  <CopyValue
                    mono={false}
                    label="Tailwind"
                    value={`@theme {\n${swatches.map(([r, h]) => `  --color-${r}: ${h};`).join("\n")}\n}`}
                    className="flex-1 justify-center border border-border"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
