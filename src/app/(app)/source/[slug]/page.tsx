import Link from "next/link";
import { notFound } from "next/navigation";
import { ITEMS, SOURCES, compact } from "@/lib/data";
import { name, INDUSTRIES, TECHNOLOGIES } from "@/lib/taxonomy";
import { Feed } from "@/components/feed/Feed";
import { PageHeader, Shell, StickyBar } from "@/components/feed/Section";
import { CopyValue } from "@/components/detail/CopyValue";

/**
 * The Source page — not in the original brief. It is where "understand how
 * interfaces are built" pays off: one product's whole system in one place.
 */
export default async function SourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "screens";
  const source = SOURCES.find((s) => s.slug === slug);
  if (!source) notFound();

  const all = ITEMS.filter((i) => i.source.slug === slug);
  const screens = all.filter((i) => i.kind === "screen");
  const comps = all.filter((i) => i.kind === "component");
  const palette = screens[0]?.palette;

  const TABS: [string, string, number][] = [
    ["screens", "Screens", screens.length],
    ["components", "Components", comps.length],
    ["system", "Palette & type", 0],
  ];

  return (
    <>
      <Shell>
        <div className="flex flex-wrap items-start gap-5 pt-8">
          <span className="h-14 w-14 shrink-0 rounded-[13px]" style={{ background: palette?.accent }} />
          <div className="min-w-0 flex-1">
            <PageHeader title={source.name} sub={source.about} />
            <div className="flex flex-wrap items-center gap-2 pt-3 text-[12.5px] text-text-2">
              <span className="rounded-[6px] border border-border px-2 py-1">{source.domain}</span>
              <Link href={`/web?industry=${source.industry}`} className="rounded-[6px] border border-border px-2 py-1 hover:bg-bg-subtle">
                {name(INDUSTRIES, source.industry)}
              </Link>
              {source.tech.map((t) => (
                <Link key={t} href={`/web?tech=${t}`} className="rounded-[6px] border border-border px-2 py-1 hover:bg-bg-subtle">
                  {name(TECHNOLOGIES, t)}
                </Link>
              ))}
              <span className="text-text-3">
                · {compact(all.reduce((a, b) => a + b.saves, 0))} saves across {all.length} items
              </span>
            </div>
          </div>
        </div>
      </Shell>

      <div className="h-5" />
      <StickyBar>
        <div className="flex gap-1 py-2">
          {TABS.map(([id, label, n]) => (
            <Link
              key={id}
              href={`/source/${slug}?tab=${id}`}
              className={`rounded-[7px] px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                tab === id ? "bg-text text-bg" : "text-text-2 hover:text-text"
              }`}
            >
              {label} {n ? <span className="tabular-nums opacity-60">{n}</span> : null}
            </Link>
          ))}
        </div>
      </StickyBar>

      <Shell>
        <div className="pt-5">
          {tab === "screens" ? <Feed items={screens} /> : null}
          {tab === "components" ? <Feed items={comps} /> : null}
          {tab === "system" && palette ? (
            <div className="grid gap-4 pb-14 lg:grid-cols-2">
              <div className="rounded-[12px] border border-border bg-surface p-5">
                <h3 className="pb-4 text-[14px] font-semibold">Inferred palette</h3>
                {(
                  [
                    ["Background", palette.bg],
                    ["Surface", palette.surface],
                    ["Raised", palette.raised],
                    ["Border", palette.border],
                    ["Text", palette.text],
                    ["Muted", palette.muted],
                    ["Accent", palette.accent],
                  ] as [string, string][]
                ).map(([label, hex]) => (
                  <div key={label} className="flex items-center gap-3 py-1.5">
                    <span className="h-7 w-7 rounded-[6px] border border-border" style={{ background: hex }} />
                    <span className="flex-1 text-[12.5px]">{label}</span>
                    <CopyValue value={hex} />
                  </div>
                ))}
              </div>
              <div className="rounded-[12px] border border-border bg-surface p-5">
                <h3 className="pb-4 text-[14px] font-semibold">Recurring structure</h3>
                <p className="pb-4 text-[13.5px] leading-relaxed text-text-2">
                  Across {screens.length} captures, these blocks appear most often. This is what a design
                  system looks like from the outside.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set(screens.flatMap((s) => s.blocks.map((b) => b.label)))].map((b) => (
                    <span key={b} className="rounded-[6px] border border-border px-2 py-1 text-[12px] text-text-2">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Shell>
    </>
  );
}
