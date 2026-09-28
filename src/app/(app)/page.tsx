import { ITEMS } from "@/lib/data";
import { applyFilters, mixFeed, sortItems, type Filters } from "@/lib/query";
import { Card } from "@/components/feed/Card";
import { Feed } from "@/components/feed/Feed";
import { Featured } from "@/components/feed/Featured";
import { ChipRail } from "@/components/feed/FilterBar";
import { SectionHead } from "@/components/feed/Section";

const CHIPS: { label: string; value?: string; filters: Filters }[] = [
  { label: "For You", filters: {} },
  { label: "Trending", value: "trending", filters: { sort: "trending" } },
  { label: "New", value: "new", filters: { sort: "new" } },
  { label: "Web", value: "web", filters: { platform: "web", kind: "screen" } },
  { label: "Mobile", value: "mobile", filters: { device: "mobile" } },
  { label: "Components", value: "components", filters: { kind: "component" } },
  { label: "Dashboard", value: "dashboard", filters: { category: "dashboard" } },
  { label: "SaaS", value: "saas", filters: { industry: "saas" } },
  { label: "Fintech", value: "fintech", filters: { industry: "fintech" } },
  { label: "E-commerce", value: "ecommerce", filters: { category: "ecommerce" } },
  { label: "Portfolio", value: "portfolio", filters: { category: "portfolio" } },
  { label: "Dark", value: "dark", filters: { style: "dark" } },
  { label: "Minimal", value: "minimal", filters: { style: "minimal" } },
  { label: "3D", value: "3d", filters: { threed: "true" } },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const chip = typeof sp.chip === "string" ? sp.chip : undefined;
  const active = CHIPS.find((c) => c.value === chip) ?? CHIPS[0];
  const filtered = applyFilters(ITEMS, active.filters);
  const items = active.value === "components" ? filtered : mixFeed(filtered);

  const trending = sortItems(ITEMS.filter((i) => i.kind === "screen"), "trending");
  const popular = trending.slice(0, 6);
  const pick = trending.find((i) => i.device === "desktop") ?? trending[0];
  const browsing = !active.value;

  return (
    <>
      <div className="min-w-0 px-4 pb-6 pt-6 md:px-6">
        <h1 className="sr-only">Uiverse — discover interfaces worth building</h1>

        <section>
          <SectionHead title="Categories" />
          <ChipRail chips={CHIPS.map((c) => ({ label: c.label, value: c.value }))} />
        </section>

        {browsing ? (
          <section className="mt-9">
            <SectionHead title="Popular this week" href="/web?sort=trending" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-6">
              {popular.map((i) => (
                <Card key={i.slug} item={i} crop={3 / 4} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-9">
          <SectionHead
            title={browsing ? "Recommended for you" : `${active.label} · ${items.length} results`}
            href={browsing ? "/explore" : "/"}
            more={browsing ? "more" : "clear"}
          />
          <Feed items={items} />
        </section>
      </div>

      <Featured item={pick} />
    </>
  );
}
