import Link from "next/link";
import { LAYOUTS } from "@/lib/data";
import { MockScreen } from "@/components/mock/MockScreen";
import { PageHeader, Shell } from "@/components/feed/Section";

/** Layouts are derived from the block order of real screens — not authored separately. */
export default function LayoutsPage() {
  return (
    <Shell>
      <PageHeader
        title="Layouts"
        sub="The structure behind a page, separated from its styling. Every layout here was derived from the section order of a real capture — plan the shape first, choose components after."
      />
      <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {LAYOUTS.map((l) => (
          <div key={l.slug} className="rounded-[12px] border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between pb-3">
              <h3 className="text-[14px] font-semibold tracking-[-0.015em]">{l.name}</h3>
              <span className="text-[11.5px] text-text-3 tabular-nums">{l.uses} uses</span>
            </div>
            <div className="flex gap-3">
              <div className="w-20 shrink-0 space-y-1">
                {l.sections.map((s, i) => (
                  <div
                    key={`${s.type}-${i}`}
                    className="rounded-[3px] border border-dashed border-border"
                    style={{ height: s.type === "hero" ? 26 : s.type === "footer" ? 14 : 11 }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden rounded-[7px] border border-border">
                <MockScreen item={{ ...l.example, aspect: 0.8 }} />
              </div>
            </div>
            <ol className="mt-3 space-y-1 border-t border-border pt-3">
              {l.sections.map((s, i) => (
                <li key={`${s.type}-${i}`} className="flex items-center gap-2 text-[12px]">
                  <span className="w-4 font-mono text-[10.5px] text-text-3 tabular-nums">{i + 1}</span>
                  <Link href={`/components?component=${s.type}`} className="text-text-2 hover:text-text hover:underline">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-[7px] border border-border px-2 py-1.5 text-[12.5px] font-medium hover:bg-bg-subtle">
                Duplicate
              </button>
              <button className="flex-1 rounded-[7px] border border-border px-2 py-1.5 text-[12.5px] font-medium hover:bg-bg-subtle">
                Open in builder
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="pb-14 text-[12.5px] text-text-3">
        The drag-and-drop builder is Phase 3. It plans structure — it never outputs a website.
      </p>
    </Shell>
  );
}
