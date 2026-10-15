import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell, PageHeader } from "@/components/feed/Section";
import { TakedownForm } from "@/components/legal/TakedownForm";
import type { Dict } from "@/i18n/dict";
import { alternates, getI18n } from "@/i18n/server";

/* the documents themselves live in the dictionary (legal.*), one per language */
const docOf = (t: Dict, doc: string) => (doc === "attribution" || doc === "takedown" ? t.legal[doc] : undefined);

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const { lang, t } = await getI18n();
  const d = docOf(t, doc);
  return d ? { title: d.title, alternates: alternates(lang, `/legal/${doc}`) } : {};
}

export default async function LegalPage({
  params,
  searchParams,
}: {
  params: Promise<{ doc: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { doc } = await params;
  const { domain } = await searchParams;
  const { t } = await getI18n();
  const d = docOf(t, doc);
  if (!d) notFound();
  return (
    <Shell wide={false}>
      <PageHeader title={d.title} />
      <div className="max-w-2xl space-y-4 py-8 pb-16">
        {d.body.map((p) => (
          <p key={p} className="text-[14.5px] leading-relaxed text-text-2">
            {p}
          </p>
        ))}
        {doc === "takedown" ? (
          <div className="pt-4">
            <TakedownForm domain={typeof domain === "string" ? domain : undefined} />
          </div>
        ) : null}
      </div>
    </Shell>
  );
}
