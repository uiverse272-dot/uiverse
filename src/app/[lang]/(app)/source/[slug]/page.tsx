import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/client";
import { blockLabel } from "@/i18n/content";
import { compactNum, fill, plural } from "@/i18n/format";
import { alternates, getI18n } from "@/i18n/server";
import { ITEMS, SOURCES } from "@/lib/data";
import { browseLink, type Scope } from "@/lib/query";
import { name, INDUSTRIES, TECHNOLOGIES } from "@/lib/taxonomy";
import { Feed } from "@/components/feed/Feed";
import { ssrColumns } from "@/components/feed/ssrColumns";
import { PageHeader, Shell, StickyBar } from "@/components/feed/Section";
import { CopyValue } from "@/components/detail/CopyValue";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const source = SOURCES.find((s) => s.slug === slug);
  if (!source) return {};
  const { lang, t } = await getI18n();
  const real = ITEMS.some((i) => i.source.slug === slug && i.capture);
  return {
    title: source.name,
    description: fill(t.source.description, { about: source.about }),
    alternates: alternates(lang, `/source/${slug}`),
    robots: real ? undefined : { index: false, follow: true },
  };
}

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
  const { lang, t } = await getI18n();
  const ssrCols = await ssrColumns();
  const tab = typeof sp.tab === "string" ? sp.tab : "screens";
  const source = SOURCES.find((s) => s.slug === slug);
  if (!source) notFound();

  const all = ITEMS.filter((i) => i.source.slug === slug);
  const screens = all.filter((i) => i.kind === "screen");
  const comps = all.filter((i) => i.kind === "component");
  const palette = screens[0]?.palette;
  /* an app-only source (SwiftUI, Flutter) links into Apps first, so its chips never open an empty feed */
  const order: Scope[] = screens.some((i) => i.device === "desktop") ? ["web", "apps"] : ["apps", "web"];

  const TABS: [string, string, number][] = [
    ["screens", t.source.screens, screens.length],
    ["components", t.source.components, comps.length],
    ["system", t.source.system, 0],
  ];

  return (
    <>
      <Shell>
        <div className="flex flex-wrap items-start gap-5 pt-8">
          <span className="h-14 w-14 shrink-0" style={{ background: palette?.accent }} />
          <div className="min-w-0 flex-1">
            <PageHeader title={source.name} sub={source.about} />
            <div className="flex flex-wrap items-center gap-2 pt-3 text-[12.5px] text-text-2">
              <bdi className="border border-border px-2 py-1">{source.domain}</bdi>
              {[
                ["industry", source.industry, name(INDUSTRIES, source.industry, lang)],
                ...source.tech.map((x) => ["tech", x, name(TECHNOLOGIES, x)]),
              ].map(([param, value, label]) => (
                <Link
                  key={value}
                  href={browseLink(param, value, order)?.href ?? "/explore"}
                  className="border border-border px-2 py-1 hover:bg-bg-subtle"
                >
                  {label}
                </Link>
              ))}
              <span className="text-text-3">
                ·{" "}
                {fill(t.source.savesAcross, {
                  saves: compactNum(all.reduce((a, b) => a + b.saves, 0), lang),
                  items: plural(t.source.items, all.length, lang),
                })}
              </span>
              {all.some((i) => i.capture) ? (
                <Link
                  href={`/legal/takedown?domain=${encodeURIComponent(source.domain)}`}
                  className="text-text-3 underline underline-offset-2 hover:text-text"
                >
                  {t.source.requestRemoval}
                </Link>
              ) : null}
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
              className={`px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                tab === id ? "bg-accent text-accent-fg" : "text-text-2 hover:text-text"
              }`}
            >
              {label} {n ? <span className="tabular-nums opacity-60">{n}</span> : null}
            </Link>
          ))}
        </div>
      </StickyBar>

      <Shell>
        <div className="pt-5">
          {tab === "screens" ? <Feed items={screens} ssrCols={ssrCols} /> : null}
          {tab === "components" ? <Feed items={comps} ssrCols={ssrCols} /> : null}
          {tab === "system" && palette ? (
            <div className="grid gap-4 pb-14 lg:grid-cols-2">
              <div className="border border-border bg-surface p-5">
                <h3 className="pb-4 text-[14px] font-semibold">{t.source.palette}</h3>
                {(
                  [
                    [t.roles.bg, palette.bg],
                    [t.roles.surface, palette.surface],
                    [t.roles.raised, palette.raised],
                    [t.roles.border, palette.border],
                    [t.roles.text, palette.text],
                    [t.roles.muted, palette.muted],
                    [t.roles.accent, palette.accent],
                  ] as [string, string][]
                ).map(([label, hex]) => (
                  <div key={label} className="flex items-center gap-3 py-1.5">
                    <span className="h-7 w-7 border border-border" style={{ background: hex }} />
                    <span className="flex-1 text-[12.5px]">{label}</span>
                    <CopyValue value={hex} />
                  </div>
                ))}
              </div>
              <div className="border border-border bg-surface p-5">
                <h3 className="pb-4 text-[14px] font-semibold">{t.source.recurring}</h3>
                <p className="pb-4 text-[13.5px] leading-relaxed text-text-2">{plural(t.source.recurringBody, screens.length, lang)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set(screens.flatMap((s) => s.blocks.map((b) => blockLabel(b.label, b.type, lang))))].map((b) => (
                    <span key={b} className="border border-border px-2 py-1 text-[12px] text-text-2">
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
