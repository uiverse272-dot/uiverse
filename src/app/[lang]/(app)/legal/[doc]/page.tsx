import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell, PageHeader } from "@/components/feed/Section";
import { Rich } from "@/components/legal/Rich";
import { TakedownForm } from "@/components/legal/TakedownForm";
import { Link } from "@/i18n/client";
import type { Dict } from "@/i18n/dict";
import { alternates, getI18n } from "@/i18n/server";

/* the documents themselves live in the dictionary (legal.*), one per language */
const DOCS = ["attribution", "takedown", "privacy"] as const;
type Doc = (typeof DOCS)[number];
const isDoc = (doc: string): doc is Doc => (DOCS as readonly string[]).includes(doc);
/* privacy also has a date and headed sections; the other two are plain paragraphs */
type LegalDoc = { title: string; body: string[]; updated?: string; sections?: { h: string; body: string[] }[] };
const docOf = (t: Dict, doc: string): LegalDoc | undefined => (isDoc(doc) ? t.legal[doc] : undefined);

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const { lang, t } = await getI18n();
  const d = docOf(t, doc);
  if (!d) return {};
  /* the doc's opening line says what it is */
  const opening = d.body[0];
  return { title: d.title, description: opening.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"), alternates: alternates(lang, `/legal/${doc}`) };
}

const P = "text-[14.5px] leading-relaxed text-text-2";

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
      <PageHeader title={d.title} sub={d.updated} />
      <div className="max-w-2xl space-y-4 py-8 pb-16">
        {d.body.map((p) => (
          <p key={p} className={P}>
            <Rich text={p} />
          </p>
        ))}
        {d.sections?.map((s) => (
          <section key={s.h} className="space-y-3 pt-4">
            <h2 className="text-[16px] font-bold">{s.h}</h2>
            {s.body.map((p) => (
              <p key={p} className={P}>
                <Rich text={p} />
              </p>
            ))}
          </section>
        ))}
        {doc === "takedown" ? (
          <div className="pt-4">
            <TakedownForm domain={typeof domain === "string" ? domain : undefined} />
          </div>
        ) : null}
        {/* the other documents, so each one leads to the rest */}
        <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-[13px] text-text-3">
          {DOCS.filter((o) => o !== doc).map((o) => (
            <Link key={o} href={`/legal/${o}`} className="underline underline-offset-2 hover:text-text">
              {t.legal[o].title}
            </Link>
          ))}
        </nav>
      </div>
    </Shell>
  );
}
