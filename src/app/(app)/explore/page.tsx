import Link from "next/link";
import { ITEMS } from "@/lib/data";
import { CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES, PLATFORMS, componentGroups } from "@/lib/taxonomy";
import { MockScreen } from "@/components/mock/MockScreen";
import { PageHeader, Shell } from "@/components/feed/Section";

/** Explore is a directory, not a second feed. Its job is turning a vague intent into a URL. */

function cover(pred: (i: (typeof ITEMS)[number]) => boolean) {
  return ITEMS.filter(pred).filter((i) => i.kind === "screen").slice(0, 1)[0];
}

function Group({
  title,
  note,
  tiles,
}: {
  title: string;
  note?: string;
  tiles: { href: string; label: string; count: number; item?: (typeof ITEMS)[number] }[];
}) {
  const visible = tiles.filter((t) => t.count > 0);
  return (
    <section className="pb-12">
      <div className="flex items-baseline gap-3 pb-4">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h2>
        {note ? <span className="text-[12.5px] text-text-3">{note}</span> : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {visible.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group overflow-hidden rounded-[11px] border border-border bg-surface transition-colors hover:border-border-strong"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-bg-subtle">
              {t.item ? (
                <div className="absolute inset-0 origin-top-left scale-[1.02]">
                  <MockScreen item={{ ...t.item, aspect: 4 / 3 }} />
                </div>
              ) : null}
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
  const count = (pred: (i: (typeof ITEMS)[number]) => boolean) => ITEMS.filter(pred).length;

  return (
    <Shell>
      <PageHeader
        title="Explore"
        sub="Start from a category, an industry, a style or a stack. Every tile is a filtered feed with a real URL you can share."
      />

      <div className="pt-8">
        <Group
          title="By type"
          tiles={CATEGORIES.map((c) => ({
            href: `/web?category=${c.slug}`,
            label: c.name,
            count: count((i) => i.category === c.slug),
            item: cover((i) => i.category === c.slug),
          }))}
        />
        <Group
          title="By component"
          note="cropped from real screens"
          tiles={componentGroups()
            .flatMap(([, items]) => items)
            .map((c) => ({
              href: `/components?component=${c.slug}`,
              label: c.name,
              count: count((i) => i.componentType === c.slug),
              item: cover((i) => i.componentType === c.slug),
            }))}
        />
        <Group
          title="By industry"
          tiles={INDUSTRIES.map((c) => ({
            href: `/web?industry=${c.slug}`,
            label: c.name,
            count: count((i) => i.industry === c.slug),
            item: cover((i) => i.industry === c.slug),
          }))}
        />
        <Group
          title="By style"
          tiles={STYLES.map((c) => ({
            href: `/web?style=${c.slug}`,
            label: c.name,
            count: count((i) => i.style === c.slug),
            item: cover((i) => i.style === c.slug),
          }))}
        />
        <Group
          title="By technology"
          tiles={TECHNOLOGIES.map((c) => ({
            href: `/web?tech=${c.slug}`,
            label: c.name,
            count: count((i) => i.tech.includes(c.slug)),
            item: cover((i) => i.tech.includes(c.slug)),
          }))}
        />
        <Group
          title="By platform"
          tiles={PLATFORMS.map((c) => ({
            href: `/apps?platform=${c.slug}`,
            label: c.name,
            count: count((i) => i.platform === c.slug),
            item: cover((i) => i.platform === c.slug),
          }))}
        />
      </div>
    </Shell>
  );
}
