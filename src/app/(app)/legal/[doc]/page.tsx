import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell, PageHeader } from "@/components/feed/Section";
import { TakedownForm } from "@/components/legal/TakedownForm";

const DOCS: Record<string, { title: string; body: string[] }> = {
  attribution: {
    title: "Attribution policy",
    body: [
      "Every screen indexed here names its source, shows its logo and links to the live site. Attribution is never hidden behind a hover or a click.",
      "We index screenshots and derived facts about a page — its colour roles, type scale, spacing rhythm and section structure. We do not redistribute a site's markup, stylesheets, fonts or image assets.",
      "Code is only ever shown when it was contributed by its author, published under an open licence, or generated as a clearly-labelled re-implementation. A screenshot of a site is not permission to copy its source.",
      "Any site owner can opt out. One request removes every item from that domain across the platform, including from search and caches, and prevents future captures.",
    ],
  },
  takedown: {
    title: "Takedown & opt-out",
    body: [
      "Send the domain and an address to reach you. Within 5 working days we remove everything captured from it — the screens, the components cropped from them, palettes, search entries, the agent API and the stored screenshots — and confirm by email.",
      "Opt-out is one entry per domain and covers its subdomains. It also stops the domain being captured again, so it doesn't come back with the next crawl.",
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const d = DOCS[(await params).doc];
  return d ? { title: d.title } : {};
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
  const d = DOCS[doc];
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
