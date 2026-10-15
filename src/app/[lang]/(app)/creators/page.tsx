import type { Metadata } from "next";
import { Link } from "@/i18n/client";
import { compactNum, fill, plural } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { CREATORS, ITEMS } from "@/lib/data";
import { MockScreen } from "@/components/mock/MockScreen";
import { PageHeader, Shell } from "@/components/feed/Section";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.creators.title };
}

const ROLE = { Studio: "studio", "Product designer": "product", "Design engineer": "engineer" } as const;

export default async function CreatorsPage() {
  const { lang, t } = await getI18n();
  const c0 = t.creators;
  return (
    <Shell>
      <PageHeader title={c0.title} sub={c0.sub} />
      <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CREATORS.map((c) => {
          const work = ITEMS.filter((i) => i.source.slug === c.source.slug && i.kind === "screen").slice(0, 3);
          return (
            <Link
              key={c.handle}
              href={`/source/${c.handle}`}
              className="group border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 shrink-0" style={{ background: work[0]?.palette.accent }} />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold">{c.name}</div>
                  <div className="truncate text-[12px] text-text-3">{c0.roles[ROLE[c.role as keyof typeof ROLE]] ?? c.role}</div>
                </div>
                {c.available ? (
                  <span className="ms-auto shrink-0 border border-border px-1.5 py-1 text-[10.5px] font-medium text-text-2">
                    {c0.available}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex gap-1.5">
                {work.map((w) => (
                  <div key={w.slug} className="flex-1 overflow-hidden border border-border">
                    <MockScreen item={{ ...w, aspect: 1.1 }} />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11.5px] text-text-3">
                <span>{plural(c0.screens, c.screens, lang)}</span>
                <span>{fill(c0.followers, { n: compactNum(c.followers, lang) })}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
