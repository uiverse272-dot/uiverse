import type { Metadata } from "next";
import { Shell } from "@/components/feed/Section";
import { Check } from "@/components/ui/icons";
import { alternates, getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.nav.pricing, alternates: alternates(lang, "/pricing") };
}

/*
 * Free is what the app actually gives everyone: discovery and understanding are never gated, and
 * the prompt generator is the one metered surface (components/prompt/quota.ts). Keep it that way —
 * a row here (dict pricing.rows) that the app doesn't enforce is a promise the product breaks.
 */
const PRICES = ["£0", "£12", "£9"];

export default async function PricingPage() {
  const { t } = await getI18n();
  const p = t.pricing;
  return (
    <Shell wide={false}>
      <div className="py-12 text-center">
        <h1 className="text-[34px] font-semibold tracking-[-0.03em]">{p.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-[14.5px] leading-relaxed text-text-2">{p.sub}</p>
      </div>

      <div className="grid gap-4 pb-10 md:grid-cols-3">
        {p.plans.map(([name, note], i) => (
          <div key={name} className={`border p-5 ${i === 1 ? "border-text bg-surface" : "border-border"}`}>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">{name}</span>
              {i === 1 ? <span className="bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">{p.popular}</span> : null}
            </div>
            <div className="mt-4 flex items-end gap-1.5">
              <bdi className="text-[38px] font-semibold tracking-[-0.03em]">{PRICES[i]}</bdi>
              <span className="pb-2 text-[13px] text-text-3">{p.perMonth}</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-text-2">{note}</p>
            <button
              className={`mt-5 h-10 w-full text-[13.5px] font-medium ${
                i === 1 ? "bg-accent text-accent-fg" : "border border-border hover:bg-bg-subtle"
              }`}
            >
              {i === 0 ? p.startFree : p.choose}
            </button>
          </div>
        ))}
      </div>

      <div className="overflow-hidden border border-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-bg-subtle text-start">
              <th className="px-4 py-2.5 text-start font-medium text-text-3">{p.feature}</th>
              {p.plans.map(([h]) => (
                <th key={h} className="px-4 py-2.5 text-start font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.rows.map(([f, a, b, c]) => (
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
      <p className="py-10 text-center text-[12.5px] text-text-3">{p.footer}</p>
    </Shell>
  );
}
