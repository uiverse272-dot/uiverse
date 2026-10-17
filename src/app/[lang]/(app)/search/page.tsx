import type { Metadata } from "next";
import { searchItems } from "@/lib/query";
import { Feed } from "@/components/feed/Feed";
import { ssrColumns } from "@/components/feed/ssrColumns";
import { Shell, StickyBar } from "@/components/feed/Section";
import { SearchField } from "@/components/shell/SearchCommand";
import { Close } from "@/components/ui/icons";
import { Link } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { getI18n } from "@/i18n/server";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const { t } = await getI18n();
  return { title: typeof q === "string" && q ? `“${q}”` : t.search.title };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ssrCols = await ssrColumns();
  const { lang, t } = await getI18n();
  const q = typeof sp.q === "string" ? sp.q : "";
  const kind = typeof sp.kind === "string" ? sp.kind : undefined;
  /* nothing to search for: no results, no counts — skip the work */
  const { results, terms, residual } = q ? searchItems(q, { kind }, lang) : { results: [], terms: [], residual: "" };
  /* the active tab's count is the results we already have; only the other two are searched */
  const count = (k?: string) => (!q ? 0 : k === kind ? results.length : searchItems(q, { kind: k }).results.length);
  const counts = { all: count(undefined), screen: count("screen"), component: count("component") };

  return (
    <>
      <Shell>
        <div className="mx-auto max-w-[620px] pb-5 pt-8">
          {/* keyed by the query, so a new search (or a removed chip) resets the field to match */}
          <SearchField big initial={q} key={q} />
        </div>
      </Shell>

      {q ? (
        <>
          <StickyBar>
            <div className="flex flex-wrap items-center gap-2 py-2.5">
              <div className="flex items-center gap-1">
                {(
                  [
                    [t.search.all, undefined, counts.all],
                    [t.search.designs, "screen", counts.screen],
                    [t.search.components, "component", counts.component],
                  ] as const
                ).map(([label, k, n]) => (
                  <Link
                    key={label}
                    href={`/search?q=${encodeURIComponent(q)}${k ? `&kind=${k}` : ""}`}
                    className={`px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                      kind === k ? "bg-accent text-accent-fg" : "text-text-2 hover:text-text"
                    }`}
                  >
                    {label} <span className="tabular-nums opacity-60">{n}</span>
                  </Link>
                ))}
              </div>
              {/* The parse is shown, not hidden. A wrong guess has a repair path. */}
              {terms.length ? (
                <div className="flex flex-wrap items-center gap-1.5 border-s border-border ps-3">
                  <span className="text-[12px] text-text-3">{t.search.readingAs}</span>
                  {terms.map((term) => (
                    <Link
                      key={term.param}
                      href={`/search?q=${encodeURIComponent(
                        q
                          .split(/\s+/)
                          .filter((w) => !term.word.split(" ").includes(w.toLowerCase()))
                          .join(" "),
                      )}`}
                      className="inline-flex items-center gap-1 border border-border bg-bg-subtle px-2 py-1 text-[12px] font-medium hover:border-border-strong"
                    >
                      {t.search.dimensions[term.param]}: {term.label}
                      <Close size={11} />
                    </Link>
                  ))}
                  {residual ? (
                    <span className="text-[12px] text-text-3">{fill(t.search.asFreeText, { q: residual })}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </StickyBar>
          <Shell>
            <div className="pt-4">
              <Feed items={results} ssrCols={ssrCols} />
            </div>
          </Shell>
        </>
      ) : (
        <Shell>
          <div className="mx-auto max-w-[620px] pb-16">
            <h2 className="pb-3 text-[13px] font-semibold text-text-3">{t.search.suggestedTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {t.search.suggested.map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="border border-border px-3 py-1.5 text-[13px] text-text-2 transition-colors hover:bg-bg-subtle hover:text-text"
                >
                  {s}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-text-2">{t.search.explainer}</p>
          </div>
        </Shell>
      )}
    </>
  );
}
