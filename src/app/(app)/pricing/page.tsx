import { Shell } from "@/components/feed/Section";
import { Check } from "@/components/ui/icons";

const ROWS: [string, string, string, string][] = [
  ["Browse everything", "✓", "✓", "✓"],
  ["Save", "Unlimited", "Unlimited", "Unlimited"],
  ["Collections", "5, public", "Unlimited, private", "Unlimited"],
  ["Filters", "Core", "All", "All"],
  ["Breakdown tab", "Colours + type", "Full", "Full"],
  ["Full screen sets", "First 3", "Full", "Full"],
  ["AI prompt generation", "3 / month", "Unlimited", "Unlimited"],
  ["Palette export", "Copy hex", "CSS + Tailwind", "+ team palettes"],
  ["Layouts", "1", "Unlimited", "Unlimited"],
  ["Team workspaces", "—", "—", "✓"],
  ["Shared collections + roles", "—", "—", "✓"],
];

export default function PricingPage() {
  return (
    <Shell wide={false}>
      <div className="py-12 text-center">
        <h1 className="text-[34px] font-semibold tracking-[-0.03em]">Simple, honest pricing</h1>
        <p className="mx-auto mt-3 max-w-lg text-[14.5px] leading-relaxed text-text-2">
          Depth and output are paid for. Discovery never is — browsing and saving stay unlimited on Free,
          because that loop is the product.
        </p>
      </div>

      <div className="grid gap-4 pb-10 md:grid-cols-3">
        {(
          [
            ["Free", "£0", "Everything you need to browse and keep references."],
            ["Pro", "£12", "For people who ship interfaces every week."],
            ["Team", "£9", "Per seat. Shared boards, libraries and roles."],
          ] as const
        ).map(([name, price, note], i) => (
          <div
            key={name}
            className={`rounded-[14px] border p-5 ${i === 1 ? "border-text bg-surface" : "border-border"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">{name}</span>
              {i === 1 ? (
                <span className="rounded-[999px] bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">
                  Popular
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex items-end gap-1.5">
              <span className="text-[38px] font-semibold tracking-[-0.03em]">{price}</span>
              <span className="pb-2 text-[13px] text-text-3">/month</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-text-2">{note}</p>
            <button
              className={`mt-5 h-10 w-full rounded-[9px] text-[13.5px] font-medium ${
                i === 1 ? "bg-accent text-accent-fg" : "border border-border hover:bg-bg-subtle"
              }`}
            >
              {i === 0 ? "Start free" : "Choose plan"}
            </button>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[12px] border border-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-bg-subtle text-left">
              <th className="px-4 py-2.5 font-medium text-text-3">Feature</th>
              {["Free", "Pro", "Team"].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([f, a, b, c]) => (
              <tr key={f} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 text-text-2">{f}</td>
                {[a, b, c].map((v, i) => (
                  <td key={i} className="px-4 py-2.5">
                    {v === "✓" ? <Check size={14} /> : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="py-10 text-center text-[12.5px] text-text-3">
        No countdown timers, no fake scarcity, cancel in one click.
      </p>
    </Shell>
  );
}
