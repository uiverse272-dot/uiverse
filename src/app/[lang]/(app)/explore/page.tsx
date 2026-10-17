import type { Metadata } from "next";
import { Link } from "@/i18n/client";
import type { Lang } from "@/i18n/config";
import { alternates, getI18n } from "@/i18n/server";
import type { Item } from "@/lib/data";
import { browseLink, type Scope } from "@/lib/query";
import { CATEGORIES, COMPONENT_TYPES, INDUSTRIES, STYLES, TECHNOLOGIES, PLATFORMS, name, type Term } from "@/lib/taxonomy";
import { MockScreen } from "@/components/mock/MockScreen";
import { PageHeader, Shell } from "@/components/feed/Section";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.explore.title, description: t.explore.sub, alternates: alternates(lang, "/explore") };
}

/** Explore is a directory, not a second feed. Its job is turning a vague intent into a URL. */

type Tile = { href: string; label: string; count: number; item: Item };

/* Each tile's count and cover come from the feed it opens, so the number on the tile is the number you land on. */
function tiles(lang: Lang, param: string, list: readonly Term[], order?: Scope[]): Tile[] {
  return list.flatMap((t) => {
    const link = browseLink(param, t.slug, order);
    return link ? [{ href: link.href, label: name(list, t.slug, lang), count: link.count, item: link.cover }] : [];
  });
}

function Group({
  title,
  note,
  tiles,
}: {
  title: string;
  note?: string;
  tiles: Tile[];
}) {
  return (
    <section className="pb-12">
      <div className="flex items-baseline gap-3 pb-4">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h2>
        {note ? <span className="text-[12.5px] text-text-3">{note}</span> : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group overflow-hidden border border-border bg-surface transition-colors hover:border-border-strong"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-bg-subtle">
              <div className="absolute inset-0 origin-top scale-[1.02]">
                <MockScreen item={{ ...t.item, aspect: 4 / 3 }} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-80" />
            </div>
            <div className="flex items-center justify-between gap-2 px-2.5 py-2">
              <span className="truncate text-[13px] font-medium">{t.label}</span>
              <span className="shrink-0 text-[11.5px] text-text-3 tabular-nums">{t.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function ExplorePage() {
  const { lang, t } = await getI18n();
  const e = t.explore;
  return (
    <Shell>
      <PageHeader title={e.title} sub={e.sub} />

      <div className="pt-8">
        <Group title={e.byType} tiles={tiles(lang, "category", CATEGORIES)} />
        <Group title={e.byComponent} note={e.componentNote} tiles={tiles(lang, "component", COMPONENT_TYPES, ["components"])} />
        <Group title={e.byIndustry} tiles={tiles(lang, "industry", INDUSTRIES)} />
        <Group title={e.byStyle} tiles={tiles(lang, "style", STYLES)} />
        <Group title={e.byTech} tiles={tiles(lang, "tech", TECHNOLOGIES)} />
        <Group title={e.byPlatform} tiles={tiles(lang, "platform", PLATFORMS, ["web", "apps"])} />
      </div>
    </Shell>
  );
}
