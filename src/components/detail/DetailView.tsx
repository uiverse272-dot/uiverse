"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Link, useI18n } from "@/i18n/client";
import { blockLabel, itemTitle, ruleText, sourceAbout } from "@/i18n/content";
import { an, fill, fillNodes, lower, plural } from "@/i18n/format";
import type { Item } from "@/lib/data";
import { name, CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES } from "@/lib/taxonomy";
import { SCOPES } from "@/lib/filters";
import { responsiveRules } from "@/lib/spec";
import { MockScreen } from "../mock/MockScreen";
import { VIEWPORTS, type Viewport } from "../mock/primitives";
import { SaveButton } from "../save/SaveButton";
import { Card } from "../feed/Card";
import { Breakdown } from "./Breakdown";
import { CopyValue } from "./CopyValue";
import { Code, External, Layers, Sparkle } from "../ui/icons";
import { Flow } from "../ui/Flow";
import { PromptDialog } from "../prompt/PromptDialog";
import { guideEvent } from "../guide/events";

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
  const { lang, t } = useI18n();
  const [tab, setTab] = useState<Tab>("overview");
  const [promptOpen, setPromptOpen] = useState(false);
  const native: Viewport = item.device === "mobile" ? "mobile" : "desktop";
  const [device, setDevice] = useState<Viewport>(native);
  const frameRef = useRef<HTMLDivElement>(null);
  const isComponent = item.kind === "component";
  useEffect(() => {
    if (tab === "breakdown") guideEvent("breakdown");
  }, [tab]);
  /* metadata links stay in the feed this item lives in — a phone screen's "Onboarding" has no web results */
  const feed = isComponent ? SCOPES.components.path : item.device === "mobile" ? SCOPES.apps.path : SCOPES.web.path;
  const showDevice = (d: Viewport) => {
    setDevice(d);
    frameRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tabs: [Tab, string][] = (["overview", "breakdown", "responsive", "code", "similar"] as const).map((id) => [id, t.detail.tabs[id]]);

  /* arrow keys move between tabs (and focus follows), as the ARIA tab pattern expects — "next" is leftward in Arabic */
  const tabIds = useId();
  const onTabKey = (e: React.KeyboardEvent) => {
    const fwd = lang === "ar" ? "ArrowLeft" : "ArrowRight";
    const back = lang === "ar" ? "ArrowRight" : "ArrowLeft";
    const step = e.key === fwd ? 1 : e.key === back ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = tabs.findIndex(([id]) => id === tab);
    const next = tabs[(i + step + tabs.length) % tabs.length][0];
    setTab(next);
    document.getElementById(`${tabIds}-${next}`)?.focus();
  };

  /* tablet and phone frames are drawn at real size (capped to the column); laptop fills it */
  const frameWidth = device === "desktop" ? "100%" : `min(100%, ${VIEWPORTS[device].w}px)`;

  return (
    <div className={presentation === "overlay" ? "" : "pb-16"}>
      <div className="mx-auto grid max-w-[1700px] gap-6 px-4 pt-5 md:px-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------------------------------------------------------- media */}
        <div>
          <div ref={frameRef} className="flex scroll-mt-20 items-center justify-between gap-3 pb-3">
            <div role="group" aria-label={t.detail.device} className="flex items-center gap-1 border border-border p-0.5">
              {(Object.keys(VIEWPORTS) as Viewport[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  aria-pressed={device === d}
                  className={`whitespace-nowrap px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    device === d ? "bg-accent text-accent-fg" : "text-text-2 hover:text-text"
                  }`}
                >
                  {t.detail.viewports[d]}
                </button>
              ))}
            </div>
            <span className="text-[12px] text-text-3">
              {item.capture
                ? /* the date never breaks across lines, and reads left to right in Arabic too */
                  fillNodes(t.detail.capturedLive, {
                    date: (
                      <bdi dir="ltr" className="whitespace-nowrap">
                        {item.capture.capturedAt.slice(0, 10)}
                      </bdi>
                    ),
                  })
                : t.detail.sampleDesign}
            </span>
          </div>

          {/* Long captures scroll inside the frame rather than making the page enormous. */}
          <div className="flex justify-center border border-border bg-bg-subtle p-3 md:p-5">
            <div
              /* focusable, so the page inside can be scrolled from the keyboard */
              tabIndex={0}
              aria-label={`${itemTitle(item, lang)} — ${t.detail.viewports[device]}`}
              className="max-h-[76vh] overflow-y-auto overscroll-contain border border-border transition-[width] duration-200"
              style={{ width: frameWidth }}
            >
              {/* a sample's text is invented: the frame's label names it, screen readers skip the rest */}
              <div aria-hidden={!item.capture || undefined}>
                <MockScreen key={device} item={item} viewport={device} eager />
              </div>
            </div>
          </div>
          <p className="pt-2 text-center text-[11.5px] text-text-3">
            {t.detail.viewports[device]} · <bdi dir="ltr">{VIEWPORTS[device].w} × {VIEWPORTS[device].h}</bdi> ·{" "}
            {item.capture
              ? t.detail.realCapture
              : device === native
                ? t.detail.original
                : fill(t.detail.adaptedFrom, { vp: lower(t.detail.viewports[native], lang) })}
            {" "}· {t.detail.scrollInside}
          </p>

          {!isComponent ? (
            <div className="mt-3 flex gap-2 overflow-x-auto scroll-x">
              {fromSource.slice(0, 6).map((s) => (
                <Link
                  key={s.slug}
                  href={s.kind === "component" ? `/component/${s.slug}` : `/screen/${s.slug}`}
                  className={`w-28 shrink-0 overflow-hidden border transition-colors ${
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
              <h1 className="text-[19px] font-bold leading-snug tracking-[-0.02em]">{itemTitle(item, lang)}</h1>
              <Link
                href={`/source/${item.source.slug}`}
                className="mt-2 inline-flex items-center gap-2 text-[12.5px]"
              >
                <span className="h-4 w-4 border border-border" style={{ background: item.palette.accent }} />
                {t.common.by} <bdi className="link-ink">{item.source.name}</bdi>
              </Link>
            </div>
          </div>

          
          <div className="mt-5 grid gap-3">
            <a
              href={item.capture?.url ?? "#"}
              {...(item.capture
                ? { target: "_blank", rel: "noopener noreferrer" }
                : { onClick: (e: React.MouseEvent) => e.preventDefault(), title: fill(t.detail.wouldOpen, { domain: item.source.domain }) })}
              className="inline-flex h-11 items-center justify-center gap-2 border border-border bg-surface text-[13.5px] hover:bg-bg-subtle"
            >
              <External size={15} /> {t.detail.openLive}
            </a>
            <SaveButton slug={item.slug} variant="solid" />
          </div>

          <div className="mt-3 grid grid-cols-3 border border-border">
            {(
              [
                ["prompt", Sparkle, () => setPromptOpen(true)],
                ["code", Code, () => setTab("code")],
                ["breakdown", Layers, () => setTab("breakdown")],
              ] as const
            ).map(([id, Icon, run], i) => (
              <button
                key={id}
                onClick={run}
                data-guide={id === "prompt" ? "prompt" : undefined}
                className={`flex flex-col items-center gap-1.5 py-3.5 text-[11px] transition-colors hover:bg-bg-subtle ${
                  i ? "border-s border-border" : ""
                }`}
              >
                <Icon size={19} />
                {t.detail.actions[id]}
              </button>
            ))}
          </div>

          <dl className="mt-6 border-y border-border py-1.5">
            <Meta label={t.detail.meta.type} value={name(CATEGORIES, item.category, lang)} href={`${feed}?category=${item.category}`} />
            <Meta label={t.detail.meta.industry} value={name(INDUSTRIES, item.industry, lang)} href={`${feed}?industry=${item.industry}`} />
            <Meta label={t.detail.meta.style} value={name(STYLES, item.style, lang)} href={`${feed}?style=${item.style}`} />
            <Meta label={t.detail.meta.platform} value={item.platform === "web" ? t.detail.web : item.platform.toUpperCase()} />
            <Meta
              label={t.detail.meta.stack}
              value={item.tech.map((t) => name(TECHNOLOGIES, t)).join(", ")}
              href={`${feed}?tech=${item.tech[0]}`}
            />
            {item.capture ? (
              <Meta label={t.detail.meta.direction} value={item.capture.dir === "rtl" ? t.detail.rtl : t.detail.ltr} />
            ) : null}
          </dl>

          <p dir="auto" className="mt-4 text-[12.5px] leading-relaxed">{sourceAbout(item.source, lang)}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {(
              [
                [item.category, name(CATEGORIES, item.category, lang)],
                [item.industry, name(INDUSTRIES, item.industry, lang)],
                [item.style, name(STYLES, item.style, lang)],
                ...item.tech.map((x) => [x, name(TECHNOLOGIES, x)]),
              ] as [string, string][]
            ).map(([slug, label]) => (
              <Link
                key={slug}
                href={`/search?q=${slug}`}
                className="border border-border px-2 py-1 text-[11.5px] text-text-2 hover:bg-bg-subtle hover:text-text"
              >
                {label}
              </Link>
            ))}
          </div>

          <p className="mt-5 border-t border-border pt-4 text-[11.5px] leading-relaxed text-text-3">
            {t.detail.attribution}{" "}
            <Link href="/legal/attribution" className="underline underline-offset-2">
              {t.detail.attributionLink}
            </Link>
            .
            {item.capture ? (
              <>
                {" "}{t.detail.yourSite}{" "}
                <Link href={`/legal/takedown?domain=${encodeURIComponent(item.source.domain)}`} className="underline underline-offset-2">
                  {t.detail.requestRemoval}
                </Link>
                .
              </>
            ) : null}
          </p>
        </aside>
      </div>

      {/* ------------------------------------------------------------- tabs */}
      <div className="mx-auto mt-8 max-w-[1700px] px-4 md:px-5">
        {/* scrolls sideways on phones — five mono labels don't fit in 390px */}
        <div
          role="tablist"
          aria-label={t.detail.tabsLabel}
          onKeyDown={onTabKey}
          className="scroll-x flex gap-1 overflow-x-auto border-b border-border"
        >
          {tabs.map(([id, label]) => (
            <button
              key={id}
              id={`${tabIds}-${id}`}
              data-guide={id === "breakdown" ? "breakdown-tab" : undefined}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`${tabIds}-panel`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              className={`relative shrink-0 whitespace-nowrap px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                tab === id ? "text-text" : "text-text-2 hover:text-text"
              }`}
            >
              {label}
              {tab === id ? <span className="absolute inset-x-0 bottom-0 h-[3px] bg-accent" /> : null}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`${tabIds}-panel`} aria-labelledby={`${tabIds}-${tab}`} className="py-6">
          {tab === "overview" ? <Overview item={item} /> : null}
          {tab === "breakdown" ? <Breakdown item={item} /> : null}
          {tab === "responsive" ? <Responsive item={item} onPick={showDevice} /> : null}
          {tab === "code" ? <CodeTab item={item} onPrompt={() => setPromptOpen(true)} /> : null}
          {tab === "similar" ? <Grid items={similar} /> : null}
        </div>

        {tab !== "similar" ? (
          <section className="border-t border-border pt-6">
            <h2 className="pb-4 text-[15px] font-bold tracking-[-0.02em]">
              {isComponent ? t.detail.related : t.detail.similar}
            </h2>
            <Grid items={similar.slice(0, 6)} />
          </section>
        ) : null}
      </div>

      {promptOpen ? <PromptDialog item={item} onClose={() => setPromptOpen(false)} /> : null}
    </div>
  );
}

function Meta({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = <span className="block truncate text-[12px]">{value || "—"}</span>;
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3 py-1.5">
      <dt className="text-[12px] text-text-2">{label}</dt>
      <dd className="min-w-0">
        {href ? (
          <Link href={href} className="hover:text-accent-ink">
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
  const { lang, t } = useI18n();
  const o = t.detail.overview;
  const first = item.blocks[0];
  const firstLabel = first ? blockLabel(first.label, first.type, lang) : "";
  const body = fill(o.body, {
    source: item.source.name,
    style: lang === "ar" ? name(STYLES, item.style, lang) : an(item.style),
    industry: lang === "ar" ? name(INDUSTRIES, item.industry, lang) : an(item.industry.replace("-", " ")),
    title: lang === "ar" ? itemTitle(item, lang) : item.title.toLowerCase(),
    first: lower(firstLabel, lang),
    sections: plural(o.sections, item.blocks.length, lang),
  });
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="border border-border bg-surface p-5">
        <h2 className="pb-3 text-[14px] font-bold">{o.title}</h2>
        <p className="text-[14px] leading-relaxed text-text-2">{body}</p>
        <ul className="mt-4 space-y-2 text-[13.5px] text-text-2">
          <li>· {item.blocks.some((b) => b.type === "cta") ? o.accentCta : o.accentPrimary}</li>
          <li>· {o.hierarchy}</li>
          <li>· {item.device === "mobile" ? o.designedMobile : o.designedDesktop}</li>
        </ul>
      </div>
      <div className="border border-border bg-surface p-5">
        <h2 className="pb-3 text-[14px] font-bold">{o.palette}</h2>
        {/* keyed by index: a palette can legitimately repeat a value (accent === text) */}
        <div className="flex overflow-hidden border border-border">
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

function Responsive({ item, onPick }: { item: Item; onPick: (d: Viewport) => void }) {
  const { lang, t } = useI18n();
  const native: Viewport = item.device === "mobile" ? "mobile" : "desktop";
  return (
    <div>
      {/* first screen of each viewport, side by side, at a shared scale */}
      <div className="grid items-start gap-4 md:grid-cols-[1.9fr_1.25fr_0.75fr]">
        {(Object.keys(VIEWPORTS) as Viewport[]).map((d) => {
          const vp = VIEWPORTS[d];
          return (
            <button
              key={d}
              onClick={() => onPick(d)}
              className="block border border-border bg-surface p-3 text-start transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--border)]"
            >
              <span className="flex items-baseline justify-between gap-2 pb-3">
                <span className="text-[13px] font-bold">{t.detail.viewports[d]}</span>
                <span className="text-[11px] text-text-3">
                  <bdi>{vp.w}px</bdi>
                  {d === native ? ` · ${t.detail.responsive.original}` : ""}
                </span>
              </span>
              <span className="block overflow-hidden border border-border" style={{ aspectRatio: `${vp.w} / ${vp.h}` }}>
                <MockScreen item={item} viewport={d} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 border border-border bg-surface p-5">
        <h2 className="pb-1 text-[14px] font-bold">{t.detail.responsive.howAdapts}</h2>
        <p className="pb-3 text-[12px] text-text-3">{t.detail.responsive.sequence}</p>
        <dl className="text-[13px]">
          {responsiveRules(item).map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b border-rule py-2.5 last:border-b-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
              <dt className="text-text-3">
                <bdi>{blockLabel(k, undefined, lang)}</bdi>
              </dt>
              <dd>
                <Flow text={ruleText(v, item, lang)} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function CodeTab({ item, onPrompt }: { item: Item; onPrompt: () => void }) {
  const { t } = useI18n();
  const c = t.detail.code;
  if (!item.hasCode) {
    return (
      <div className="border border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <Code size={18} className="mt-0.5 shrink-0 text-text-3" />
          <div>
            <h2 className="text-[14px] font-bold">{c.noneTitle}</h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-text-2">
              {c.noneBody}{" "}
              <Link href="/legal/attribution" className="underline underline-offset-2">
                {c.policy}
              </Link>
              .
            </p>
            <button
              onClick={onPrompt}
              className="mt-4 inline-flex h-9 items-center gap-1.5 border border-border px-3 text-[13px] font-medium hover:bg-bg-subtle"
            >
              <Sparkle size={14} /> {c.instead}
            </button>
          </div>
        </div>
      </div>
    );
  }
  const snippet = `export function ${item.componentType ? cap(item.componentType) : "Section"}() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-24">
      <h2 className="text-[48px] font-bold tracking-[-0.03em]">
        ${item.source.tagline}
      </h2>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-500">
        Contributed by ${item.source.name} under MIT.
      </p>
    </section>
  );
}`;
  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex gap-1">
          {["React", "HTML", "Tailwind"].map((x, i) => (
            <span
              key={x}
              className={`px-2 py-1 text-[12px] font-medium ${i === 0 ? "bg-bg-subtle" : "text-text-3"}`}
            >
              {x}
            </span>
          ))}
        </div>
        <span className="flex items-center gap-3">
          <span className="border border-border px-1.5 py-0.5 font-mono text-[10.5px] text-text-3">{c.contributed}</span>
          <CopyValue value={snippet} label={t.common.copy} mono={false} className="border border-border" />
        </span>
      </div>
      {/* code reads left to right whatever the page language */}
      <pre dir="ltr" className="overflow-auto p-4 text-left font-mono text-[12px] leading-relaxed text-text-2">{snippet}</pre>
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
        <Card key={i.slug} item={i} lazy />
      ))}
    </div>
  );
}
