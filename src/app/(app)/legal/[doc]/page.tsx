import { Shell, PageHeader } from "@/components/feed/Section";

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
      "Send the domain and a contact address and we will remove everything captured from it, platform-wide, within 5 working days.",
      "Opt-out is a single flag on the source record — it removes the items, the derived components, the palettes and the search entries in one action.",
    ],
  },
};

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = DOCS[doc] ?? { title: "Legal", body: ["Not found."] };
  return (
    <Shell wide={false}>
      <PageHeader title={d.title} />
      <div className="max-w-2xl space-y-4 py-8 pb-16">
        {d.body.map((p) => (
          <p key={p} className="text-[14.5px] leading-relaxed text-text-2">
            {p}
          </p>
        ))}
      </div>
    </Shell>
  );
}
