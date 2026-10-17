import type { Metadata } from "next";
import { Link } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { alternates, getI18n } from "@/i18n/server";
import { PALETTE_ITEMS } from "@/lib/data";
import { CopyValue } from "@/components/detail/CopyValue";
import { PageHeader, Shell } from "@/components/feed/Section";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.palettes.title, alternates: alternates(lang, "/palettes") };
}

export default async function PalettesPage() {
  const { t } = await getI18n();
  return (
    <Shell>
      <PageHeader title={t.palettes.title} sub={t.palettes.sub} />
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
            <div key={p.slug} className="overflow-hidden border border-border bg-surface">
              <div className="flex h-28">
                {swatches.map(([role, hex]) => (
                  <div key={role} className="flex-1" style={{ background: hex }} />
                ))}
              </div>
              <div className="p-3.5">
                <bdi className="block text-[14px] font-semibold">{p.palette.name}</bdi>
                <Link
                  href={`/source/${p.source.slug}`}
                  className="mt-1 block text-[12px] text-text-3 hover:text-text"
                >
                  {fill(t.palettes.from, { name: p.source.name })}
                </Link>
                <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-border pt-3">
                  {swatches.map(([role, hex]) => (
                    <div key={role} className="flex items-center gap-1.5">
                      <span className="h-3 w-3 shrink-0 border border-border" style={{ background: hex }} />
                      <CopyValue value={hex} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-1.5">
                  <CopyValue
                    mono={false}
                    label={t.palettes.css}
                    value={swatches.map(([r, h]) => `  --${r}: ${h};`).join("\n")}
                    className="flex-1 justify-center border border-border"
                  />
                  <CopyValue
                    mono={false}
                    label={t.palettes.tailwind}
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
