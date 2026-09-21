"use client";

import Link from "next/link";
import { useState } from "react";
import { compact, timeAgo, type Item } from "@/lib/data";
import { name, CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES } from "@/lib/taxonomy";
import { MockScreen } from "../mock/MockScreen";
import { SaveButton } from "../save/SaveButton";
import { Card } from "../feed/Card";
import { Breakdown } from "./Breakdown";
import { CopyValue } from "./CopyValue";
import { Code, External, Sparkle } from "../ui/icons";
import { PromptDialog } from "../prompt/PromptDialog";

type Tab = "overview" | "breakdown" | "responsive" | "code" | "similar";

export function DetailView({
  item,
  similar,
  fromSource,
  presentation = "page",
}: {
  item: Item;
  similar: Item[];
  fromSource: Item[];
  presentation?: "page" | "overlay";
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [promptOpen, setPromptOpen] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    item.device === "mobile" ? "mobile" : "desktop",
  );
  const isComponent = item.kind === "component";

  const tabs: [Tab, string][] = [
    ["overview", "Overview"],
    ["breakdown", "Breakdown"],
    ["responsive", isComponent ? "In the wild" : "Responsive"],
    ["code", "Code"],
    ["similar", "Similar"],
  ];

  const frameWidth = device === "desktop" ? "100%" : device === "tablet" ? "62%" : "30%";

  return (
    <div className={presentation === "overlay" ? "" : "pb-16"}>
      <div className="mx-auto grid max-w-[1700px] gap-6 px-4 pt-5 md:px-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------------------------------------------------------- media */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1 rounded-[8px] border border-border p-0.5">
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  disabled={item.device === "mobile" && d !== "mobile"}
                  className={`rounded-[6px] px-2.5 py-1 text-[12px] font-medium capitalize transition-colors disabled:opacity-30 ${
                    device === d ? "bg-text text-bg" : "text-text-2 hover:text-text"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <span className="text-[12px] text-text-3">
              Captured {timeAgo(item.daysAgo)} · {compact(item.views)} views
            </span>
          </div>

          {/* Long captures scroll inside the frame rather than making the page enormous. */}
          <div className="flex justify-center rounded-[14px] border border-border bg-bg-subtle p-3 md:p-5">
            <div
              className="max-h-[76vh] overflow-y-auto overscroll-contain rounded-[10px] border border-border transition-[width] duration-200"
              style={{ width: frameWidth }}
            >
              <MockScreen item={item} full={!isComponent} />
            </div>
          </div>
          <p className="pt-2 text-center text-[11.5px] text-text-3">
            Scroll inside the frame to see the full page
          </p>

          {!isComponent ? (
            <div className="mt-3 flex gap-2 overflow-x-auto scroll-x">
              {fromSource.slice(0, 6).map((s) => (
                <Link
                  key={s.slug}
                  href={s.kind === "component" ? `/component/${s.slug}` : `/screen/${s.slug}`}
                  className={`w-28 shrink-0 overflow-hidden rounded-[8px] border transition-colors ${
                    s.slug === item.slug ? "border-text" : "border-border hover:border-border-strong"
                  }`}
                >
                  <MockScreen item={{ ...s, aspect: 1.5 }} />
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {/* ----------------------------------------------------------- rail */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em]">{item.title}</h1>
              <Link
                href={`/source/${item.source.slug}`}
                className="mt-2 inline-flex items-center gap-2 text-[13.5px] text-text-2 hover:text-text"
              >
                <span className="h-5 w-5 rounded-[5px]" style={{ background: item.palette.accent }} />
                {item.source.name}
              </Link>
            </div>
          </div>

          <p className="mt-3 text-[13.5px] leading-relaxed text-text-2">{item.source.about}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SaveButton slug={item.slug} variant="solid" />
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex h-10 items-center gap-1.5 rounded-[8px] border border-border px-3.5 text-[13.5px] font-medium hover:bg-bg-subtle"
              title={`This would open ${item.source.domain}`}
            >
              <External size={14} /> Open live
            </a>
            <button
              onClick={() => setPromptOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-[8px] border border-border px-3.5 text-[13.5px] font-medium hover:bg-bg-subtle"
            >
              <Sparkle size={14} /> Prompt
            </button>
          </div>

          <dl className="mt-6 space-y-0 rounded-[11px] border border-border">
            <Meta label="Type" value={name(CATEGORIES, item.category)} href={`/web?category=${item.category}`} />
            <Meta label="Industry" value={name(INDUSTRIES, item.industry)} href={`/web?industry=${item.industry}`} />
            <Meta label="Style" value={name(STYLES, item.style)} href={`/web?style=${item.style}`} />
            <Meta label="Platform" value={item.platform === "web" ? "Web" : item.platform.toUpperCase()} />
            <Meta
              label="Stack"
              value={item.tech.map((t) => name(TECHNOLOGIES, t)).join(", ")}
              href={`/web?tech=${item.tech[0]}`}
            />
            <Meta label="Saves" value={compact(item.saves)} last />
          </dl>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {[item.category, item.industry, item.style, ...item.tech].map((t) => (
              <Link
                key={t}
                href={`/search?q=${t}`}
                className="rounded-[6px] border border-border px-2 py-1 text-[11.5px] text-text-2 hover:bg-bg-subtle hover:text-text"
              >
                {t}
              </Link>
            ))}
          </div>

          <p className="mt-5 border-t border-border pt-4 text-[11.5px] leading-relaxed text-text-3">
            Preview rendered from the capture. Attribution links to the source;{" "}
            <Link href="/legal/attribution" className="underline underline-offset-2">
              attribution policy
            </Link>
            .
          </p>
        </aside>
      </div>

      {/* ------------------------------------------------------------- tabs */}
      <div className="mx-auto mt-8 max-w-[1700px] px-4 md:px-5">
        <div className="flex gap-1 border-b border-border">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                tab === id ? "text-text" : "text-text-2 hover:text-text"
              }`}
            >
              {label}
              {tab === id ? <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-text" /> : null}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "overview" ? <Overview item={item} /> : null}
          {tab === "breakdown" ? <Breakdown item={item} /> : null}
          {tab === "responsive" ? <Responsive item={item} /> : null}
          {tab === "code" ? <CodeTab item={item} onPrompt={() => setPromptOpen(true)} /> : null}
          {tab === "similar" ? <Grid items={similar} /> : null}
        </div>

        {tab !== "similar" ? (
          <section className="border-t border-border pt-6">
            <h2 className="pb-4 text-[15px] font-semibold tracking-[-0.02em]">
              {isComponent ? "Related components" : "Similar designs"}
            </h2>
            <Grid items={similar.slice(0, 6)} />
          </section>
        ) : null}
      </div>

      {promptOpen ? <PromptDialog item={item} onClose={() => setPromptOpen(false)} /> : null}
    </div>
  );
}

function Meta({ label, value, href, last }: { label: string; value: string; href?: string; last?: boolean }) {
  const body = <span className="truncate text-[12.5px] font-medium">{value || "—"}</span>;
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2.5 ${last ? "" : "border-b border-border"}`}>
      <dt className="text-[12.5px] text-text-3">{label}</dt>
      <dd className="min-w-0">
        {href ? (
          <Link href={href} className="hover:underline">
            {body}
          </Link>
        ) : (
          body
        )}
      </dd>
    </div>
  );
}

function Overview({ item }: { item: Item }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-[12px] border border-border bg-surface p-5">
        <h3 className="pb-3 text-[14px] font-semibold">What this screen does</h3>
        <p className="text-[14px] leading-relaxed text-text-2">
          {item.source.name} uses a {item.style} treatment for a {item.industry.replace("-", " ")} audience.
          The {item.title.toLowerCase()} leads with {item.blocks[0]?.label.toLowerCase()} and resolves in{" "}
          {item.blocks.length} distinct sections — a structure you can reuse directly from the Breakdown tab.
        </p>
        <ul className="mt-4 space-y-2 text-[13.5px] text-text-2">
          <li>· Accent used sparingly, on {item.blocks.some((b) => b.type === "cta") ? "CTAs and one metric band" : "primary actions only"}.</li>
          <li>· Type hierarchy carried by size and weight rather than colour.</li>
          <li>· {item.responsive ? "Responsive captures available at three widths." : "Native mobile capture — no desktop equivalent."}</li>
        </ul>
      </div>
      <div className="rounded-[12px] border border-border bg-surface p-5">
        <h3 className="pb-3 text-[14px] font-semibold">Palette</h3>
        {/* keyed by index: a palette can legitimately repeat a value (accent === text) */}
        <div className="flex overflow-hidden rounded-[8px] border border-border">
          {item.colors.map((c, i) => (
            <div key={i} className="h-16 flex-1" style={{ background: c }} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {item.colors.map((c, i) => (
            <CopyValue key={i} value={c} className="border border-border" />
          ))}
        </div>
      </div>
    </div>
  );
}

function Responsive({ item }: { item: Item }) {
  if (item.device === "mobile") {
    return (
      <div className="rounded-[12px] border border-border bg-surface p-5">
        <h3 className="pb-2 text-[14px] font-semibold">Where this pattern appears</h3>
        <p className="text-[13.5px] text-text-2">
          Native capture — this screen has no desktop equivalent. In Phase 2 this tab becomes the flow
          viewer: the ordered run of screens this one belongs to.
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {(
          [
            ["Desktop", "1440px", 1],
            ["Tablet", "834px", 0.72],
            ["Mobile", "390px", 0.42],
          ] as const
        ).map(([label, w, scale]) => (
          <div key={label} className="rounded-[12px] border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between pb-3">
              <span className="text-[13px] font-semibold">{label}</span>
              <span className="font-mono text-[11px] text-text-3">{w}</span>
            </div>
            <div className="mx-auto overflow-hidden rounded-[7px] border border-border" style={{ width: `${scale * 100}%` }}>
              <MockScreen item={item} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[12px] border border-border bg-surface p-5">
        <h3 className="pb-3 text-[14px] font-semibold">Documented behaviour</h3>
        <dl className="grid gap-x-8 gap-y-2.5 text-[13px] sm:grid-cols-2">
          {[
            ["Navigation", "Full nav → condensed → hamburger at 760px"],
            ["Feature grid", "3 columns → 2 → 1"],
            ["Hero type", "68px → 44px → 32px"],
            ["Container", "1440 max → fluid with 24px gutters"],
            ["Tables", "All columns → horizontal scroll → stacked rows"],
            ["Sticky rail", "Sticky → inline above content"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-border py-1.5">
              <dt className="shrink-0 text-text-3">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function CodeTab({ item, onPrompt }: { item: Item; onPrompt: () => void }) {
  if (!item.hasCode) {
    return (
      <div className="rounded-[12px] border border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <Code size={18} className="mt-0.5 shrink-0 text-text-3" />
          <div>
            <h3 className="text-[14px] font-semibold">No code for this capture</h3>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-text-2">
              Code is only ever shown when it was contributed by its author, published under a licence, or
              generated as a clearly-labelled re-implementation. Screenshots of a live site are indexed with
              attribution; its markup and CSS are not redistributed. See{" "}
              <Link href="/legal/attribution" className="underline underline-offset-2">
                the attribution policy
              </Link>
              .
            </p>
            <button
              onClick={onPrompt}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border px-3 text-[13px] font-medium hover:bg-bg-subtle"
            >
              <Sparkle size={14} /> Generate an implementation prompt instead
            </button>
          </div>
        </div>
      </div>
    );
  }
  const snippet = `export function ${item.componentType ? cap(item.componentType) : "Section"}() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-24">
      <h2 className="text-[48px] font-semibold tracking-[-0.03em]">
        ${item.source.tagline}
      </h2>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-500">
        Contributed by ${item.source.name} under MIT.
      </p>
    </section>
  );
}`;
  return (
    <div className="rounded-[12px] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex gap-1">
          {["React", "HTML", "Tailwind"].map((t, i) => (
            <span
              key={t}
              className={`rounded-[6px] px-2 py-1 text-[12px] font-medium ${i === 0 ? "bg-bg-subtle" : "text-text-3"}`}
            >
              {t}
            </span>
          ))}
        </div>
        <span className="flex items-center gap-3">
          <span className="rounded-[5px] border border-border px-1.5 py-0.5 font-mono text-[10.5px] text-text-3">
            MIT · contributed
          </span>
          <CopyValue value={snippet} label="Copy" mono={false} className="border border-border" />
        </span>
      </div>
      <pre className="overflow-auto p-4 font-mono text-[12px] leading-relaxed text-text-2">{snippet}</pre>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-(\w)/g, (_, c) => c.toUpperCase());
}

function Grid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((i) => (
        <Card key={i.slug} item={i} />
      ))}
    </div>
  );
}
