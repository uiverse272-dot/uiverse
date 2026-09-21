import Link from "next/link";
import { searchItems } from "@/lib/query";
import { Feed } from "@/components/feed/Feed";
import { Shell, StickyBar } from "@/components/feed/Section";
import { SearchField } from "@/components/shell/SearchCommand";
import { Close } from "@/components/ui/icons";

const SUGGESTED = [
  "dark fintech dashboard",
  "minimal saas pricing",
  "luxury ecommerce landing page",
  "ios onboarding",
  "brutalist portfolio",
  "editorial blog",
  "react tailwind hero",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const kind = typeof sp.kind === "string" ? sp.kind : undefined;
  const { results, terms, residual } = searchItems(q, { kind });

  const counts = {
    all: searchItems(q).results.length,
    screen: searchItems(q, { kind: "screen" }).results.length,
    component: searchItems(q, { kind: "component" }).results.length,
  };

  return (
    <>
      <Shell>
        <div className="mx-auto max-w-[620px] pb-5 pt-8">
          <SearchField big />
        </div>
      </Shell>

      {q ? (
        <>
          <StickyBar>
            <div className="flex flex-wrap items-center gap-2 py-2.5">
              <div className="flex items-center gap-1">
                {(
                  [
                    ["All", undefined, counts.all],
                    ["Designs", "screen", counts.screen],
                    ["Components", "component", counts.component],
                  ] as const
                ).map(([label, k, n]) => (
                  <Link
                    key={label}
                    href={`/search?q=${encodeURIComponent(q)}${k ? `&kind=${k}` : ""}`}
                    className={`rounded-[7px] px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                      kind === k ? "bg-text text-bg" : "text-text-2 hover:text-text"
                    }`}
                  >
                    {label} <span className="tabular-nums opacity-60">{n}</span>
                  </Link>
                ))}
              </div>

              {/* The parse is shown, not hidden. A wrong guess has a repair path. */}
              {terms.length ? (
                <div className="flex flex-wrap items-center gap-1.5 border-l border-border pl-3">
                  <span className="text-[12px] text-text-3">Reading as</span>
                  {terms.map((t) => (
                    <Link
                      key={t.param}
                      href={`/search?q=${encodeURIComponent(
                        q
                          .split(/\s+/)
                          .filter((w) => w.toLowerCase() !== t.value && w.toLowerCase() !== t.label.toLowerCase())
                          .join(" "),
                      )}`}
                      className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-bg-subtle px-2 py-1 text-[12px] font-medium hover:border-border-strong"
                    >
                      {t.dimension}: {t.label}
                      <Close size={11} />
                    </Link>
                  ))}
                  {residual ? (
                    <span className="text-[12px] text-text-3">
                      + “{residual}” as free text
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </StickyBar>

          <Shell>
            <div className="pt-4">
              <Feed items={results} />
            </div>
          </Shell>
        </>
      ) : (
        <Shell>
          <div className="mx-auto max-w-[620px] pb-16">
            <h2 className="pb-3 text-[13px] font-semibold text-text-3">Try a natural-language query</h2>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="rounded-[999px] border border-border px-3 py-1.5 text-[13px] text-text-2 transition-colors hover:bg-bg-subtle hover:text-text"
                >
                  {s}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-text-2">
              Queries are parsed against the taxonomy first — deterministic, explainable and reusable as URL
              state — then widened with free text. Whatever the parser decides is shown back to you as chips
              you can remove.
            </p>
          </div>
        </Shell>
      )}
    </>
  );
}
