import type { Metadata } from "next";
import { ITEMS } from "@/lib/data";
import { lookFromParams, lookQuery, similarToLook, type Look } from "@/lib/look";
import { Feed } from "@/components/feed/Feed";
import { ssrColumns } from "@/components/feed/ssrColumns";
import { PageHeader, Shell } from "@/components/feed/Section";
import { ImageDrop } from "@/components/similar/ImageDrop";
import { Link } from "@/i18n/client";
import { alternates, getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.similar.title, description: t.similar.sub, alternates: alternates(lang, "/similar") };
}

/**
 * Visual search. The image is read in the browser (components/similar/ImageDrop) and arrives
 * here as three colours and a device, so the results are a plain server-rendered feed at a URL.
 */
export default async function SimilarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const look = lookFromParams(await searchParams);
  const ssrCols = await ssrColumns();
  const { t } = await getI18n();
  const s = t.similar;
  const results = look ? similarToLook(look, ITEMS) : [];

  return (
    <Shell>
      <PageHeader title={s.title} sub={s.sub} />
      <div className="max-w-[720px] pt-6">
        <ImageDrop compact={!!look} />
      </div>

      {look ? (
        <>
          {/* the reading is shown, not hidden: the colours compared, and a device that's one click to change */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border py-4">
            <span className="text-[12px] text-text-3">{s.readingAs}</span>
            {(["bg", "text", "accent"] as const).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-[12px]">
                <span className="h-4 w-4 border border-border" style={{ background: look[k] }} />
                {s.roles[k]} <code dir="ltr" className="font-mono text-[11px] text-text-3">{look[k]}</code>
              </span>
            ))}
            <span className="flex items-center gap-1 border-s border-border ps-4">
              {([undefined, "desktop", "mobile"] as const).map((d) => (
                <Link
                  key={d ?? "any"}
                  href={`/similar?${lookQuery({ ...look, device: d } as Look)}`}
                  scroll={false}
                  className={`px-2.5 py-1 text-[12.5px] font-medium ${
                    look.device === d ? "bg-accent text-accent-fg" : "text-text-2 hover:text-text"
                  }`}
                >
                  {d ? s[d] : s.anyDevice}
                </Link>
              ))}
            </span>
          </div>
          <div className="pt-4">
            <Feed items={results} ssrCols={ssrCols} />
          </div>
          <p className="pb-14 pt-6 text-[12.5px] text-text-3">{s.how}</p>
        </>
      ) : (
        <p className="max-w-[720px] pb-16 pt-4 text-[13px] leading-relaxed text-text-2">{s.how}</p>
      )}
    </Shell>
  );
}
