import type { Metadata } from "next";
import { ITEMS } from "@/lib/data";
import { applyFilters } from "@/lib/query";
import { Feed } from "@/components/feed/Feed";
import { PageHeader, Shell } from "@/components/feed/Section";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.threeD.title };
}

export default async function ThreeDPage() {
  const { t } = await getI18n();
  const items = applyFilters(ITEMS, { threed: "true" });
  return (
    <Shell>
      <PageHeader title={t.threeD.title} sub={t.threeD.sub} />
      <div className="pt-6">
        <Feed items={items} />
      </div>
    </Shell>
  );
}
