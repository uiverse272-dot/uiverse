"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useI18n, useLocalPath, useLocalRouter } from "@/i18n/client";
import { stripLang } from "@/i18n/config";
import { fill, fillNodes, lower, plural } from "@/i18n/format";
import { fromStart } from "../ui/fromStart";
import { useFocusTrap } from "../ui/useFocusTrap";
import { Check, Close, Sparkle } from "../ui/icons";
import { onGuideEvent, onGuideStart, type GuideEvent } from "./events";
import { describe, GOALS, GUIDE_INDUSTRIES, landing, type Goal, type Landings } from "./goals";
import { parseState, type State } from "./state";

/**
 * First-visit guide. It asks what you're building, lands you on real interfaces for it, then
 * coaches the one loop that matters — open one → Breakdown → Prompt → copy → save — advancing
 * when you actually do each thing. It never blocks the page: the highlight is a ring, the
 * coach is a small panel, and both can be dismissed at any step.
 */

/* each step's title and body: dict guide.steps[id] */
type Step = { id: string; target: string; on: GuideEvent | "detail"; page: "feed" | "detail" };

const STEPS: Step[] = [
  {
    id: "open",
    target: '[data-guide="card"]',
    on: "detail",
    page: "feed",
  },
  {
    id: "breakdown",
    target: '[data-guide="breakdown-tab"]',
    on: "breakdown",
    page: "detail",
  },
  {
    id: "prompt",
    target: '[data-guide="prompt"]',
    on: "prompt-open",
    page: "detail",
  },
  {
    id: "copy",
    target: '[data-guide="prompt-copy"]',
    on: "prompt-copy",
    page: "detail",
  },
  {
    id: "save",
    target: '[data-guide="save"]',
    on: "save",
    page: "detail",
  },
];

const KEY = "uiv.guide";
const isDetail = (p: string) => /^\/(screen|component)\//.test(p);

function load(): State | null {
  try {
    return parseState(localStorage.getItem(KEY), STEPS.length);
  } catch {
    return null;
  }
}
function persist(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function Guide({ landings }: { landings: Landings }) {
  const pathname = useLocalPath();
  const router = useLocalRouter();
  const [state, setState] = useState<State | null>(null);
  const [target, setTarget] = useState<DOMRect | null>(null);

  const update = useCallback((s: State) => {
    setState(s);
    persist(s);
  }, []);

  /* first visit opens the welcome; ?tour=1 reopens it. Read after mount so SSR markup never differs. */
  useEffect(() => {
    const saved = load();
    const asked = new URLSearchParams(window.location.search).has("tour");
    const quiet = /^\/(legal|dev-measure)/.test(stripLang(window.location.pathname));
    const t = setTimeout(() => {
      if (asked) setState({ status: "welcome", step: 0, goal: saved?.goal });
      else if (saved) setState(saved);
      else if (!quiet) setState({ status: "welcome", step: 0 });
    }, 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => onGuideStart(() => setState((s) => ({ status: "welcome", step: 0, goal: s?.goal }))), []);

  /* "open one" is done whenever a design is open — derived from the URL, not stored */
  const current = state ? state.step + (STEPS[state.step]?.on === "detail" && isDetail(pathname) ? 1 : 0) : 0;

  /* advance on real actions: an event jumps past the step it completes (doing Prompt first skips Breakdown) */
  useEffect(() => {
    if (state?.status !== "active") return;
    return onGuideEvent((e) => {
      if (e === "prompt-close" && STEPS[current]?.id === "copy") return update({ ...state, step: current - 1 });
      const at = STEPS.findIndex((s, i) => i >= current && s.on === e);
      if (at >= 0) update(at + 1 >= STEPS.length ? { ...state, status: "finished" } : { ...state, step: at + 1 });
    });
  }, [state, current, update]);

  if (!state || state.status === "off") return null;

  const end = () => update({ ...state, status: "off" });

  if (state.status === "welcome") {
    return (
      <Welcome
        landings={landings}
        initial={state.goal}
        onSkip={end}
        onGo={(goal) => {
          update({ status: "active", step: 0, goal });
          router.push(landing(goal, landings).href);
        }}
      />
    );
  }

  if (state.status === "finished") return <Finished onClose={end} />;

  const step = STEPS[current];
  const goalHref = state.goal ? landing(state.goal, landings).href : "/";
  /* a detail step with no detail open — say how to get back on track instead of pointing at nothing */
  const offTrack = step.page === "detail" && !isDetail(pathname);
  const dodge = !offTrack && target;
  return (
    <>
      {!offTrack ? <Spotlight key={step.id} selector={step.target} scroll={step.page === "detail"} onRect={setTarget} /> : null}
      <Coach
        side={dodge && fromStart(target) < 480 && target.bottom > window.innerHeight - 320 ? "end" : "start"}
        index={current}
        step={step}
        goal={state.goal}
        offTrack={offTrack}
        onFeed={/^\/(web|apps|components)/.test(pathname)}
        goalHref={goalHref}
        onSkip={() => update(current + 1 >= STEPS.length ? { ...state, status: "finished" } : { ...state, step: current + 1 })}
        onEnd={end}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Welcome({
  initial,
  landings,
  onSkip,
  onGo,
}: {
  initial?: Goal;
  landings: Landings;
  onSkip: () => void;
  onGo: (g: Goal) => void;
}) {
  const { lang, t } = useI18n();
  const g = t.guide;
  const [goal, setGoal] = useState<Goal>(initial ?? { id: "landing", rtl: false });
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(dialog);
  const land = landing(goal, landings);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onSkip();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center p-4">
      <button aria-hidden tabIndex={-1} onClick={onSkip} className="absolute inset-0 cursor-default bg-[var(--overlay)]" />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="anim-fade-up relative max-h-[90dvh] w-full max-w-[680px] overflow-y-auto border border-border bg-bg shadow-[6px_6px_0_var(--border)]"
      >
        <div className="flex items-center justify-between border-b border-border bg-signal ps-5 text-on-signal">
          <span className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.12em]">
            <Sparkle size={13} /> {g.welcome}
          </span>
          <button onClick={onSkip} aria-label={t.common.close} className="grid h-11 w-11 place-items-center border-s border-on-signal/30">
            <Close size={16} />
          </button>
        </div>

        <div className="p-5 md:p-7">
          <h2 id={titleId} className="font-display text-[24px] font-bold leading-tight tracking-[-0.02em] md:text-[28px]">
            {g.question}
          </h2>
          <p className="mt-2 max-w-[520px] text-[13.5px] leading-relaxed text-text-2">{g.intro}</p>

          <div role="group" aria-label={g.goal} className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GOALS.map((goalDef) => {
              const on = goal.id === goalDef.id;
              const [label, hint] = g.goals[goalDef.id];
              return (
                <button
                  key={goalDef.id}
                  onClick={() => setGoal((x) => ({ ...x, id: goalDef.id }))}
                  aria-pressed={on}
                  className={`border p-3 text-start transition-colors ${
                    on ? "border-text bg-surface shadow-[3px_3px_0_var(--border)]" : "border-border hover:bg-bg-subtle"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-bold leading-snug">{label}</span>
                    {on ? <Check size={14} className="mt-0.5 shrink-0" /> : null}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-text-3">{hint}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="pb-2 text-[12px] font-bold">
              {g.industry} <span className="font-normal text-text-3">— {t.common.optional}</span>
            </div>
            <div role="group" aria-label={g.industry} className="flex flex-wrap gap-1.5">
              {GUIDE_INDUSTRIES.map((slug) => {
                const label = g.industries[slug];
                const on = goal.industry === slug;
                return (
                  <button
                    key={slug}
                    onClick={() => setGoal((x) => ({ ...x, industry: on ? undefined : slug }))}
                    aria-pressed={on}
                    className={`border px-2.5 py-1.5 text-[12px] transition-colors ${
                      on ? "border-text bg-accent text-accent-fg" : "border-border hover:bg-bg-subtle"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            role="switch"
            aria-checked={goal.rtl}
            onClick={() => setGoal((x) => ({ ...x, rtl: !x.rtl }))}
            className="mt-5 flex w-full items-center gap-3 border border-border p-3 text-start hover:bg-bg-subtle"
          >
            <span
              aria-hidden
              className={`relative h-5 w-9 shrink-0 border border-border transition-colors ${goal.rtl ? "bg-accent" : "bg-bg-subtle"}`}
            >
              <span className={`absolute top-0.5 h-3.5 w-3.5 border border-border bg-bg transition-[inset-inline-start] ${goal.rtl ? "start-[18px]" : "start-0.5"}`} />
            </span>
            <span>
              <span className="block text-[13px] font-bold">
                {g.rtlTitle} <span className="font-normal text-text-3">·</span>{" "}
                <bdi lang={lang === "ar" ? "en" : "ar"} className="font-normal text-text-3">{g.rtlNative}</bdi>
              </span>
              <span className="block text-[11.5px] text-text-3">{g.rtlHint}</span>
            </span>
          </button>

          {/* pinned to the bottom of the dialog, so the next step is always in reach on a phone */}
          <div className="sticky -bottom-5 -mx-5 mt-6 flex flex-col-reverse items-stretch gap-2 border-t border-border bg-bg px-5 pb-5 pt-4 sm:flex-row sm:items-center sm:justify-between md:-bottom-7 md:-mx-7 md:px-7 md:pb-7">
            <button onClick={onSkip} className="h-11 px-2 text-[13px] text-text-2 underline-offset-4 hover:text-text hover:underline">
              {g.justBrowsing}
            </button>
            <div className="flex flex-col items-stretch gap-1 sm:items-end">
              <button
                onClick={() => onGo(goal)}
                className="h-11 bg-accent px-5 text-[13.5px] font-medium text-accent-fg hover:brightness-105"
              >
                {plural(g.show, land.count, lang)} {t.common.arrow}
              </button>
              {land.relaxed.length ? (
                <span className="text-[11px] text-text-3">
                  {fill(g.noExact, {
                    rtl: goal.rtl && !land.relaxed.includes("dir") ? g.rtlPrefix : "",
                    goal: lower(g.goals[goal.id][0], lang),
                  })}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Coach({
  side,
  index,
  step,
  goal,
  offTrack,
  onFeed,
  goalHref,
  onSkip,
  onEnd,
}: {
  side: "start" | "end";
  index: number;
  step: Step;
  goal?: Goal;
  offTrack: boolean;
  onFeed: boolean;
  goalHref: string;
  onSkip: () => void;
  onEnd: () => void;
}) {
  const { lang, t } = useI18n();
  const [title, body] = t.guide.steps[step.id];
  return (
    <section
      aria-label={t.guide.label}
      aria-live="polite"
      className={`anim-fade-up fixed inset-x-3 bottom-[68px] z-[106] border border-border bg-bg shadow-[4px_4px_0_var(--border)] md:inset-x-auto md:bottom-6 md:w-[340px] ${
        /* dodge the thing it's pointing at */
        /* the copy step points into the Prompt dialog: sit over the bottom of the prompt text, clear
           of the tool and stack choices it asks you to make and of the Copy button */
        step.id === "copy" ? "coach-over-prompt" : side === "end" ? "md:end-6" : "md:start-[112px]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border bg-signal ps-3.5 text-on-signal">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
          {fill(t.guide.stepOf, { i: index + 1, n: STEPS.length })}
        </span>
        <button onClick={onEnd} aria-label={t.guide.end} className="grid h-9 w-9 place-items-center border-s border-on-signal/30">
          <Close size={14} />
        </button>
      </div>
      <div className="flex gap-1 px-3.5 pt-3" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s.id} className={`h-1 flex-1 ${i < index ? "bg-text" : i === index ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
      <div className="px-3.5 pb-3.5 pt-3">
        <h2 className="text-[14px] font-bold leading-snug">{offTrack ? t.guide.offTitle : title}</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-text-2">{offTrack ? t.guide.offBody : body}</p>
        {goal ? <p className="mt-2 text-[11px] text-text-3">{fill(t.guide.building, { what: describe(goal, t.guide, lang) })}</p> : null}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button onClick={onSkip} className="text-[12px] text-text-2 underline-offset-4 hover:text-text hover:underline">
            {t.guide.skip}
          </button>
          {offTrack || (step.page === "feed" && !onFeed) ? (
            <Link href={goalHref} className="inline-flex h-8 items-center bg-accent px-3 text-[12px] font-medium text-accent-fg">
              {t.guide.showResults} {t.common.arrow}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Finished({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <section
      aria-label={t.guide.label}
      aria-live="polite"
      className="anim-fade-up fixed inset-x-3 bottom-[68px] z-[106] border border-border bg-bg shadow-[4px_4px_0_var(--border)] md:inset-x-auto md:bottom-6 md:start-[112px] md:w-[360px]"
    >
      <div className="border-b border-border bg-signal px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-on-signal">
        {t.guide.loop}
      </div>
      <div className="p-3.5">
        <ol className="space-y-1.5 text-[12.5px] leading-relaxed text-text-2">
          {t.guide.loopSteps.map(([k, v]) => (
            <li key={k}>
              <b className="text-text">{k}</b> —{" "}
              {fillNodes(v, { kbd: <kbd dir="ltr" className="border border-border px-1 font-mono text-[10.5px]">⌘K</kbd> })}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[11.5px] text-text-3">{t.guide.replay}</p>
        <button onClick={onClose} className="mt-3 h-9 w-full bg-accent text-[13px] font-medium text-accent-fg">
          {t.guide.gotIt}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Bring the target to the middle of its scroll container — the page, or the detail overlay.
 * Not scrollIntoView: that also scrolls overflow:hidden ancestors, and in the Prompt dialog it
 * shoved the panel's content up out of its frame.
 */
function centre(el: HTMLElement) {
  let box = el.parentElement;
  while (box && !(/(auto|scroll)/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight)) box = box.parentElement;
  const r = el.getBoundingClientRect();
  const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  const into = box ? box.getBoundingClientRect() : { top: 0, height: innerHeight };
  const by = r.top + r.height / 2 - (into.top + into.height / 2);
  (box ?? window).scrollBy({ top: by, behavior });
}

/**
 * A ring around the step's target, with the rest of the page softly dimmed. It never takes
 * pointer events — the point is that you click the real thing underneath.
 */
function Spotlight({ selector, scroll, onRect }: { selector: string; scroll: boolean; onRect: (r: DOMRect | null) => void }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const scrolled = useRef(false);

  useEffect(() => {
    let raf = 0;
    const find = () => {
      const all = [...document.querySelectorAll<HTMLElement>(selector)].filter((el) => el.getClientRects().length);
      /* several matches (feed cards): the first one fully on screen below the header */
      return all.find((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 64 && r.bottom <= innerHeight;
      }) ?? all[0];
    };
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = find();
        if (el && scroll && !scrolled.current) {
          scrolled.current = true;
          const r = el.getBoundingClientRect();
          if (r.top < 64 || r.bottom > innerHeight - 80) centre(el);
        }
        const r = el ? el.getBoundingClientRect() : null;
        setRect(r);
        onRect(r);
      });
    };
    measure();
    const tick = setInterval(measure, 300); // layout changes (images, overlays) that fire no event
    addEventListener("scroll", measure, { passive: true, capture: true });
    addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tick);
      removeEventListener("scroll", measure, { capture: true });
      removeEventListener("resize", measure);
    };
  }, [selector, scroll, onRect]);

  if (!rect) return null;
  const pad = 6;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[105] border-2 border-signal transition-[top,left,width,height] duration-150 motion-reduce:transition-none"
      style={{
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        boxShadow: "0 0 0 3px var(--text), 0 0 0 100vmax rgb(0 0 0 / 0.22)",
      }}
    />
  );
}
