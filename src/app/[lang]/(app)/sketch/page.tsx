import type { Metadata } from "next";
import { PageHeader, Shell } from "@/components/feed/Section";
import { SketchPad } from "@/components/sketch/SketchPad";
import { alternates, getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.sketch.title, description: t.sketch.sub, alternates: alternates(lang, "/sketch") };
}

/** Draw the shape of a page, get the same structured prompt a captured screen gets — see lib/sketch. */
export default async function SketchPage() {
  const { t } = await getI18n();
  return (
    <Shell>
      <PageHeader title={t.sketch.title} sub={t.sketch.sub} />
      <SketchPad />
    </Shell>
  );
}
