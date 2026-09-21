import Link from "next/link";
import { CREATORS, ITEMS, compact } from "@/lib/data";
import { MockScreen } from "@/components/mock/MockScreen";
import { PageHeader, Shell } from "@/components/feed/Section";

export default function CreatorsPage() {
  return (
    <Shell>
      <PageHeader
        title="Creators"
        sub="A user and a creator are the same identity — a creator is simply a user with a filled profile. One object, one page, no merge problem later."
      />
      <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CREATORS.map((c) => {
          const work = ITEMS.filter((i) => i.source.slug === c.source.slug && i.kind === "screen").slice(0, 3);
          return (
            <Link
              key={c.handle}
              href={`/source/${c.handle}`}
              className="group rounded-[12px] border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 shrink-0 rounded-[9px]" style={{ background: work[0]?.palette.accent }} />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold">{c.name}</div>
                  <div className="truncate text-[12px] text-text-3">{c.role}</div>
                </div>
                {c.available ? (
                  <span className="ml-auto shrink-0 rounded-[6px] border border-border px-1.5 py-1 text-[10.5px] font-medium text-text-2">
                    Available
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex gap-1.5">
                {work.map((w) => (
                  <div key={w.slug} className="flex-1 overflow-hidden rounded-[6px] border border-border">
                    <MockScreen item={{ ...w, aspect: 1.1 }} />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11.5px] text-text-3">
                <span>{c.screens} screens</span>
                <span>{compact(c.followers)} followers</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
