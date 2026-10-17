import type { Metadata } from "next";
import { LAYOUTS } from "@/lib/data";
import { MockScreen } from "@/components/mock/MockScreen";
import { PageHeader, Shell } from "@/components/feed/Section";
import { Link } from "@/i18n/client";
import { blockLabel, layoutName } from "@/i18n/content";
import { alternates, getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.layouts.title, alternates: alternates(lang, "/layouts") };
}

/** Layouts are derived from the block order of real screens — not authored separately. */
export default async function LayoutsPage() {
  const { lang, t } = await getI18n();
  return (
    <Shell>
      <PageHeader title={t.layouts.title} sub={t.layouts.sub} />

      <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {LAYOUTS.map((l) => (
          <div key={l.slug} className="border border-border bg-surface p-4">
            <h3 className="pb-3 text-[14px] font-semibold tracking-[-0.015em]">{layoutName(l.example.archetype, l.name, lang)}</h3>
            <div className="flex gap-3">
              <div className="w-20 shrink-0 space-y-1">
                {l.sections.map((s, i) => (
                  <div
                    key={`${s.type}-${i}`}
                    className="border border-dashed border-border"
                    style={{ height: s.type === "hero" ? 26 : s.type === "footer" ? 14 : 11 }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden border border-border">
                <MockScreen item={{ ...l.example, aspect: 0.8 }} />
              </div>
            </div>
            <ol className="mt-3 space-y-1 border-t border-border pt-3">
              {l.sections.map((s, i) => (
                <li key={`${s.type}-${i}`} className="flex items-center gap-2 text-[12px]">
                  <span className="w-4 font-mono text-[10.5px] text-text-3 tabular-nums">{i + 1}</span>
                  <Link href={`/components?component=${s.type}`} className="text-text-2 hover:text-text hover:underline">
                    {blockLabel(s.label, s.type, lang)}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 border border-border px-2 py-1.5 text-[12.5px] font-medium hover:bg-bg-subtle">
                {t.layouts.duplicate}
              </button>
              <button className="flex-1 border border-border px-2 py-1.5 text-[12.5px] font-medium hover:bg-bg-subtle">
                {t.layouts.builder}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="pb-14 text-[12.5px] text-text-3">{t.layouts.footnote}</p>
    </Shell>
  );
}
