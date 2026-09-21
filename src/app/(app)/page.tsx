import { ITEMS } from "@/lib/data";
import { applyFilters, mixFeed, type Filters } from "@/lib/query";
import { Feed } from "@/components/feed/Feed";
import { ChipRail } from "@/components/feed/FilterBar";
import { SearchField } from "@/components/shell/SearchCommand";
import { Shell, StickyBar } from "@/components/feed/Section";

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

  return (
    <>
      {/* Compact discovery header — not a marketing hero. It collapses away on scroll. */}
      <Shell>
        <div className="flex flex-col items-center gap-5 pb-6 pt-10 md:pt-14">
          <div className="text-center">
            <h1 className="text-[30px] font-semibold tracking-[-0.03em] md:text-[38px]">
              Discover interfaces worth building.
            </h1>
            <p className="mx-auto mt-2.5 max-w-[540px] text-[14px] leading-relaxed text-text-2 md:text-[15px]">
              Websites, apps, components and patterns from products people actually ship —
              broken down so you can rebuild them.
            </p>
          </div>
          <div className="w-full max-w-[600px]">
            <SearchField big />
          </div>
        </div>
      </Shell>

      <StickyBar>
        <div className="py-2.5">
          <ChipRail chips={CHIPS.map((c) => ({ label: c.label, value: c.value }))} />
        </div>
      </StickyBar>

      <Shell>
        <div className="pt-4">
          <Feed items={items} />
        </div>
      </Shell>
    </>
  );
}
