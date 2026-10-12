import Link from "next/link";
import type { Item } from "@/lib/data";
import { browseLink, type Scope } from "@/lib/query";
import { CATEGORIES, COMPONENT_TYPES, INDUSTRIES, STYLES, TECHNOLOGIES, PLATFORMS } from "@/lib/taxonomy";
import { MockScreen } from "@/components/mock/MockScreen";
import { PageHeader, Shell } from "@/components/feed/Section";

/** Explore is a directory, not a second feed. Its job is turning a vague intent into a URL. */

type Tile = { href: string; label: string; count: number; item: Item };

/* Each tile's count and cover come from the feed it opens, so the number on the tile is the number you land on. */
function tiles(param: string, list: readonly { slug: string; name: string }[], order?: Scope[]): Tile[] {
  return list.flatMap((t) => {
    const link = browseLink(param, t.slug, order);
    return link ? [{ href: link.href, label: t.name, count: link.count, item: link.cover }] : [];
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
              <div className="absolute inset-0 origin-top-left scale-[1.02]">
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

export default function ExplorePage() {
  return (
    <Shell>
      <PageHeader
        title="Explore"
        sub="Start from a category, an industry, a style or a stack. Every tile is a filtered feed with a real URL you can share."
      />

      <div className="pt-8">
        <Group title="By type" tiles={tiles("category", CATEGORIES)} />
        <Group
          title="By component"
          note="cropped from real screens"
          tiles={tiles("component", COMPONENT_TYPES, ["components"])}
        />
        <Group title="By industry" tiles={tiles("industry", INDUSTRIES)} />
        <Group title="By style" tiles={tiles("style", STYLES)} />
        <Group title="By technology" tiles={tiles("tech", TECHNOLOGIES)} />
        <Group title="By platform" tiles={tiles("platform", PLATFORMS, ["web", "apps"])} />
      </div>
    </Shell>
  );
}
