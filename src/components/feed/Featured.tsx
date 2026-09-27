import Link from "next/link";
import { compact, timeAgo, type Item } from "@/lib/data";
import { name, CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES } from "@/lib/taxonomy";
import { MockScreen } from "../mock/MockScreen";
import { SaveButton } from "../save/SaveButton";
import { Code, External, Layers } from "../ui/icons";

/** The home page's right column: one pick, shown as a catalogue record. */
export function Featured({ item }: { item: Item }) {
  const href = `/screen/${item.slug}`;
  const rows: [string, string][] = [
    ["Saves", compact(item.saves)],
    ["Type", name(CATEGORIES, item.category)],
    ["Industry", name(INDUSTRIES, item.industry)],
    ["Style", name(STYLES, item.style)],
    ["Stack", item.tech.map((t) => name(TECHNOLOGIES, t)).join(", ")],
    ["Captured", timeAgo(item.daysAgo)],
  ];

  return (
    <div className="px-5 py-6">
      <div className="text-[11px] uppercase tracking-[0.12em] text-text-2">Pick of the week</div>

      <div className="mt-3 flex gap-4">
        <Link href={href} className="block w-[92px] shrink-0 border border-border bg-surface p-1">
          <div className="overflow-hidden border border-border">
            <MockScreen item={{ ...item, aspect: 3 / 4 }} />
          </div>
        </Link>
        <div className="min-w-0">
          <h2 className="text-[16px] font-bold leading-snug">{item.title}</h2>
          <div className="mt-2 text-[12px]">
            By:{" "}
            <Link href={`/source/${item.source.slug}`} className="link-ink">
              {item.source.name}
            </Link>
          </div>
          <div className="mt-0.5 text-[12px]">
            Site: <span className="link-ink">{item.source.domain}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <Link
          href={href}
          className="flex h-11 items-center justify-center border border-border bg-surface text-[13.5px] transition-colors hover:bg-bg-subtle"
        >
          Open the breakdown
        </Link>
        <SaveButton slug={item.slug} variant="solid" />
      </div>

      <div className="mt-3 grid grid-cols-3 border border-border">
        <Cell href={href} label="Live site" Icon={External} />
        <Cell href={href} label="Sections" Icon={Layers} border />
        <Cell href={href} label="Code" Icon={Code} border />
      </div>

      <dl className="mt-6 space-y-2.5 border-b border-border pb-5">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-[12px]">
            <dt className="text-text-2">{k}</dt>
            <dd className="truncate">{v || "—"}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-[12.5px] leading-[1.7]">{item.source.about}</p>
    </div>
  );
}

function Cell({
  href,
  label,
  Icon,
  border,
}: {
  href: string;
  label: string;
  Icon: (p: { size?: number }) => React.ReactNode;
  border?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1.5 py-3.5 text-[11px] transition-colors hover:bg-bg-subtle ${
        border ? "border-l border-border" : ""
      }`}
    >
      <Icon size={19} />
      {label}
    </Link>
  );
}
