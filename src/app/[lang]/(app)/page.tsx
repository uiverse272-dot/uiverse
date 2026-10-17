import type { Metadata } from "next";
import type { Dict } from "@/i18n/dict";
import { fill, plural } from "@/i18n/format";
import { alternates, getI18n } from "@/i18n/server";
import { ITEMS } from "@/lib/data";
import { applyFilters, mixFeed, sortItems, type Filters } from "@/lib/query";
import { Card } from "@/components/feed/Card";
import { Feed } from "@/components/feed/Feed";
import { ssrColumns } from "@/components/feed/ssrColumns";
import { Featured } from "@/components/feed/Featured";
import { ChipRail } from "@/components/feed/FilterBar";
import { SectionHead } from "@/components/feed/Section";

const CHIPS: { key: keyof Dict["home"]["chips"]; value?: string; filters: Filters }[] = [
  { key: "forYou", filters: {} },
  { key: "new", value: "new", filters: { sort: "new" } },
  { key: "web", value: "web", filters: { platform: "web", kind: "screen" } },
  { key: "mobile", value: "mobile", filters: { device: "mobile" } },
  { key: "components", value: "components", filters: { kind: "component" } },
  { key: "rtl", value: "rtl", filters: { dir: "rtl" } },
  { key: "dashboard", value: "dashboard", filters: { category: "dashboard" } },
  { key: "saas", value: "saas", filters: { industry: "saas" } },
  { key: "fintech", value: "fintech", filters: { industry: "fintech" } },
  { key: "ecommerce", value: "ecommerce", filters: { category: "ecommerce" } },
  { key: "portfolio", value: "portfolio", filters: { category: "portfolio" } },
  { key: "dark", value: "dark", filters: { style: "dark" } },
  { key: "minimal", value: "minimal", filters: { style: "minimal" } },
  { key: "threeD", value: "3d", filters: { threed: "true" } },
];

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  return { alternates: alternates(lang, "/") };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ssrCols = await ssrColumns();
  const { lang, t } = await getI18n();
  const chip = typeof sp.chip === "string" ? sp.chip : undefined;
  const active = CHIPS.find((c) => c.value === chip) ?? CHIPS[0];
  const filtered = applyFilters(ITEMS, active.filters);
  const items = active.value === "components" ? filtered : mixFeed(filtered);

  const top = sortItems(ITEMS.filter((i) => i.kind === "screen"));
  const featured = top.slice(0, 6);
  const pick = top.find((i) => i.device === "desktop") ?? top[0];
  const browsing = !active.value;
  /* real captures from the live web, newest first */
  const captured = sortItems(ITEMS.filter((i) => i.capture && i.kind === "screen"), "new").slice(0, 6);

  return (
    <>
      <div className="min-w-0 px-4 pb-6 pt-6 md:px-6">
        <h1 className="sr-only">{t.home.h1}</h1>

        <section>
          <SectionHead title={t.home.categories} />
          <ChipRail chips={CHIPS.map((c) => ({ label: t.home.chips[c.key], value: c.value }))} />
        </section>

        {browsing && captured.length ? (
          <section className="mt-9">
            <SectionHead title={t.home.captured} href="/search?q=captured" more={t.common.more} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-6">
              {captured.map((i) => (
                <Card key={i.slug} item={i} crop={3 / 4} />
              ))}
            </div>
          </section>
        ) : null}

        {browsing ? (
          <section className="mt-9">
            <SectionHead title={t.home.featured} href="/web" more={t.common.more} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-6">
              {featured.map((i) => (
                <Card key={i.slug} item={i} crop={3 / 4} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-9">
          <SectionHead
            title={
              browsing
                ? t.home.recommended
                : fill(t.home.filtered, { label: t.home.chips[active.key], results: plural(t.common.results, items.length, lang) })
            }
            href={browsing ? "/explore" : "/"}
            more={browsing ? t.common.more : t.common.clearLower}
          />
          <Feed items={items} ssrCols={ssrCols} />
        </section>
      </div>

      <Featured item={pick} />
    </>
  );
}
