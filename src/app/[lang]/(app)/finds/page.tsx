import type { Metadata } from "next";
import { Link } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { alternates, getI18n } from "@/i18n/server";
import { FIND_TAGS, FINDS, isFindTag, tagName } from "@/lib/finds";
import { FindCard } from "@/components/finds/FindCard";
import { PageHeader, Shell } from "@/components/feed/Section";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.finds.title, description: t.finds.sub, alternates: alternates(lang, "/finds") };
}

const chip = (on: boolean) =>
  `border px-2.5 py-1 text-[12.5px] ${on ? "border-border-strong bg-surface text-text" : "border-border text-text-2 hover:bg-bg-subtle hover:text-text"}`;

export default async function FindsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { lang, t } = await getI18n();
  const raw = (await searchParams).tag;
  const tag = typeof raw === "string" && isFindTag(raw) ? raw : undefined;
  const finds = tag ? FINDS.filter((f) => f.tags.includes(tag)) : FINDS;
  /* only the tags something carries, so a chip never leads to an empty page */
  const used = FIND_TAGS.filter((x) => FINDS.some((f) => f.tags.includes(x.slug)));

  return (
    <Shell>
      <PageHeader
        title={t.finds.title}
        sub={t.finds.sub}
        right={
          <Link href="/finds/submit" className="inline-flex h-10 items-center border border-border bg-accent px-4 text-[13.5px] font-medium text-accent-fg">
            {t.finds.submit}
          </Link>
        }
      />

      {used.length ? (
        <nav className="flex flex-wrap gap-1.5 pt-6">
          <Link href="/finds" className={chip(!tag)}>
            {t.finds.all}
          </Link>
          {used.map((x) => (
            <Link key={x.slug} href={`/finds?tag=${x.slug}`} className={chip(tag === x.slug)}>
              {tagName(x.slug, lang)}
            </Link>
          ))}
        </nav>
      ) : null}

      {finds.length ? (
        /* columns, not a grid: images keep their own shapes */
        <div className="gap-4 py-8 [column-fill:_balance] sm:columns-2 lg:columns-3 2xl:columns-4">
          {finds.map((f, i) => (
            <div key={f.slug} className="mb-6 break-inside-avoid">
              <FindCard find={f} eager={i < 4} />
            </div>
          ))}
        </div>
      ) : (
        <div className="my-10 max-w-2xl border border-border bg-surface p-6">
          <h2 className="text-[16px] font-bold">{tag ? fill(t.finds.noneTagged, { tag: tagName(tag, lang) }) : t.finds.emptyTitle}</h2>
          {tag ? null : <p className="mt-2 text-[14px] leading-relaxed text-text-2">{t.finds.emptyBody}</p>}
          <Link href="/finds/submit" className="mt-4 inline-flex h-10 items-center bg-accent px-4 text-[13.5px] font-medium text-accent-fg">
            {t.finds.submit}
          </Link>
        </div>
      )}

      <p className="border-t border-border py-6 text-[13px] text-text-3">
        {t.finds.originals}{" "}
        <Link href="/source/uiverse-originals" className="underline underline-offset-2 hover:text-text">
          {t.finds.originalsLink}
        </Link>
      </p>
    </Shell>
  );
}
