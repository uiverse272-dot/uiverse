"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useFocusTrap } from "../ui/useFocusTrap";
import { Check, Close, Sparkle } from "../ui/icons";
import { onGuideEvent, onGuideStart, type GuideEvent } from "./events";
import { describe, GOALS, GUIDE_INDUSTRIES, landing, type Goal } from "./goals";

/**
 * First-visit guide. It asks what you're building, lands you on real interfaces for it, then
 * coaches the one loop that matters — open one → Breakdown → Prompt → copy → save — advancing
 * when you actually do each thing. It never blocks the page: the highlight is a ring, the
 * coach is a small panel, and both can be dismissed at any step.
 */

type Step = { id: string; title: string; body: string; target: string; on: GuideEvent | "detail"; page: "feed" | "detail" };

const STEPS: Step[] = [
  {
    id: "open",
    title: "Open one that's close",
    body: "These are real interfaces for your goal. Narrow them with the filters — RTL included — then open any design close to what you want.",
    target: '[data-guide="card"]',
    on: "detail",
    page: "feed",
  },
  {
    id: "breakdown",
    title: "See how it's built",
    body: "Open the Breakdown tab: section order, colours, type scale and spacing — measured from the page, not guessed.",
    target: '[data-guide="breakdown-tab"]',
    on: "breakdown",
    page: "detail",
  },
  {
    id: "prompt",
    title: "Turn it into a build prompt",
    body: "Prompt writes a spec from those measurements for Claude, Cursor, v0 and the rest.",
    target: '[data-guide="prompt"]',
    on: "prompt-open",
    page: "detail",
  },
  {
    id: "copy",
    title: "Pick your tool, then copy",
    body: "Choose the AI tool and stack you use, copy the prompt, and paste it there. You get a build in your own brand — not a clone.",
    target: '[data-guide="prompt-copy"]',
    on: "prompt-copy",
    page: "detail",
  },
  {
    id: "save",
    title: "Keep it",
    body: "Save it so it's waiting in Saved when you come back. Do the same for anything else worth keeping.",
    target: '[data-guide="save"]',
    on: "save",
    page: "detail",
  },
];

type State = { status: "welcome" | "active" | "finished" | "off"; step: number; goal?: Goal };
const KEY = "uiv.guide";
const isDetail = (p: string) => /^\/(screen|component)\//.test(p);

function load(): State | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as State) : null;
  } catch {
    return null;
  }
}
function persist(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function Guide() {
  const pathname = usePathname();
  const router = useRouter();
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
    const quiet = /^\/(legal|dev-measure)/.test(window.location.pathname);
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
        initial={state.goal}
        onSkip={end}
        onGo={(goal) => {
          update({ status: "active", step: 0, goal });
          router.push(landing(goal).href);
        }}
      />
    );
  }

  if (state.status === "finished") return <Finished onClose={end} />;

  const step = STEPS[current];
  const goalHref = state.goal ? landing(state.goal).href : "/";
  /* a detail step with no detail open — say how to get back on track instead of pointing at nothing */
  const offTrack = step.page === "detail" && !isDetail(pathname);
  const dodge = !offTrack && target;
  return (
    <>
      {!offTrack ? <Spotlight key={step.id} selector={step.target} scroll={step.page === "detail"} onRect={setTarget} /> : null}
      <Coach
        side={dodge && target.left < 480 && target.bottom > window.innerHeight - 320 ? "right" : "left"}
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

function Welcome({ initial, onSkip, onGo }: { initial?: Goal; onSkip: () => void; onGo: (g: Goal) => void }) {
  const [goal, setGoal] = useState<Goal>(initial ?? { id: "landing", rtl: false });
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(dialog);
  const land = useMemo(() => landing(goal), [goal]);

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
        <div className="flex items-center justify-between border-b border-border bg-signal pl-5 text-on-signal">
          <span className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.12em]">
            <Sparkle size={13} /> Welcome to Uiverse
          </span>
          <button onClick={onSkip} aria-label="Close" className="grid h-11 w-11 place-items-center border-l border-on-signal/30">
            <Close size={16} />
          </button>
        </div>

        <div className="p-5 md:p-7">
          <h2 id={titleId} className="font-display text-[24px] font-bold leading-tight tracking-[-0.02em] md:text-[28px]">
            What are you building?
          </h2>
          <p className="mt-2 max-w-[520px] text-[13.5px] leading-relaxed text-text-2">
            Pick one and we&apos;ll show you real interfaces to learn from — then walk you from finding one to a build
            prompt for your AI tool. About a minute.
          </p>

          <div role="group" aria-label="Goal" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GOALS.map((g) => {
              const on = goal.id === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGoal((x) => ({ ...x, id: g.id }))}
                  aria-pressed={on}
                  className={`border p-3 text-left transition-colors ${
                    on ? "border-text bg-surface shadow-[3px_3px_0_var(--border)]" : "border-border hover:bg-bg-subtle"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-bold leading-snug">{g.label}</span>
                    {on ? <Check size={14} className="mt-0.5 shrink-0" /> : null}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-text-3">{g.hint}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="pb-2 text-[12px] font-bold">
              Industry <span className="font-normal text-text-3">— optional</span>
            </div>
            <div role="group" aria-label="Industry" className="flex flex-wrap gap-1.5">
              {GUIDE_INDUSTRIES.map(([slug, label]) => {
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
            className="mt-5 flex w-full items-center gap-3 border border-border p-3 text-left hover:bg-bg-subtle"
          >
            <span
              aria-hidden
              className={`relative h-5 w-9 shrink-0 border border-border transition-colors ${goal.rtl ? "bg-accent" : "bg-bg-subtle"}`}
            >
              <span className={`absolute top-0.5 h-3.5 w-3.5 border border-border bg-bg transition-[left] ${goal.rtl ? "left-[18px]" : "left-0.5"}`} />
            </span>
            <span>
              <span className="block text-[13px] font-bold">
                Arabic / right-to-left <span className="font-normal text-text-3">·</span>{" "}
                <bdi lang="ar" className="font-normal text-text-3">عربي</bdi>
              </span>
              <span className="block text-[11.5px] text-text-3">Real RTL interfaces, and prompts that build RTL-first</span>
            </span>
          </button>

          {/* pinned to the bottom of the dialog, so the next step is always in reach on a phone */}
          <div className="sticky -bottom-5 -mx-5 mt-6 flex flex-col-reverse items-stretch gap-2 border-t border-border bg-bg px-5 pb-5 pt-4 sm:flex-row sm:items-center sm:justify-between md:-bottom-7 md:-mx-7 md:px-7 md:pb-7">
            <button onClick={onSkip} className="h-11 px-2 text-[13px] text-text-2 underline-offset-4 hover:text-text hover:underline">
              Just browsing
            </button>
            <div className="flex flex-col items-stretch gap-1 sm:items-end">
              <button
                onClick={() => onGo(goal)}
                className="h-11 bg-accent px-5 text-[13.5px] font-medium text-accent-fg hover:brightness-105"
              >
                Show {land.count} {land.count === 1 ? "design" : "designs"} →
              </button>
              {land.relaxed.length ? (
                <span className="text-[11px] text-text-3">
                  No exact match yet — showing every {goal.rtl && !land.relaxed.includes("dir") ? "RTL " : ""}
                  {GOALS.find((g) => g.id === goal.id)?.label.toLowerCase()} design
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
  side: "left" | "right";
  index: number;
  step: Step;
  goal?: Goal;
  offTrack: boolean;
  onFeed: boolean;
  goalHref: string;
  onSkip: () => void;
  onEnd: () => void;
}) {
  return (
    <section
      aria-label="Guide"
      aria-live="polite"
      className={`anim-fade-up fixed inset-x-3 bottom-[68px] z-[96] border border-border bg-bg shadow-[4px_4px_0_var(--border)] md:inset-x-auto md:bottom-6 md:w-[340px] ${
        /* dodge the thing it's pointing at */
        side === "right" ? "md:right-6" : "md:left-[112px]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border bg-signal pl-3.5 text-on-signal">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
          Guide · {index + 1} of {STEPS.length}
        </span>
        <button onClick={onEnd} aria-label="End guide" className="grid h-9 w-9 place-items-center border-l border-on-signal/30">
          <Close size={14} />
        </button>
      </div>
      <div className="flex gap-1 px-3.5 pt-3" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s.id} className={`h-1 flex-1 ${i < index ? "bg-text" : i === index ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
      <div className="px-3.5 pb-3.5 pt-3">
        <h2 className="text-[14px] font-bold leading-snug">{offTrack ? "Open a design to continue" : step.title}</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-text-2">
          {offTrack ? "The next steps happen on a design's page. Pick up where you left off:" : step.body}
        </p>
        {goal ? <p className="mt-2 text-[11px] text-text-3">Building: {describe(goal)}</p> : null}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button onClick={onSkip} className="text-[12px] text-text-2 underline-offset-4 hover:text-text hover:underline">
            Skip this step
          </button>
          {offTrack || (step.page === "feed" && !onFeed) ? (
            <Link href={goalHref} className="inline-flex h-8 items-center bg-accent px-3 text-[12px] font-medium text-accent-fg">
              Show my results →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Finished({ onClose }: { onClose: () => void }) {
  return (
    <section
      aria-label="Guide"
      aria-live="polite"
      className="anim-fade-up fixed inset-x-3 bottom-[68px] z-[96] border border-border bg-bg shadow-[4px_4px_0_var(--border)] md:inset-x-auto md:bottom-6 md:left-[112px] md:w-[360px]"
    >
      <div className="border-b border-border bg-signal px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-on-signal">
        That&apos;s the loop
      </div>
      <div className="p-3.5">
        <ol className="space-y-1.5 text-[12.5px] leading-relaxed text-text-2">
          <li><b className="text-text">Find</b> — a feed, filters, or <kbd className="border border-border px-1 font-mono text-[10.5px]">⌘K</kbd> search from anywhere</li>
          <li><b className="text-text">Open</b> — anything close to what you want</li>
          <li><b className="text-text">Understand</b> — Breakdown and Responsive show the real values</li>
          <li><b className="text-text">Build</b> — Prompt, for the tool you use</li>
        </ol>
        <p className="mt-3 text-[11.5px] text-text-3">Replay this guide any time from More.</p>
        <button onClick={onClose} className="mt-3 h-9 w-full bg-accent text-[13px] font-medium text-accent-fg">
          Got it
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

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
          if (r.top < 64 || r.bottom > innerHeight - 80)
            el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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
      className="pointer-events-none fixed z-[95] border-2 border-signal transition-[top,left,width,height] duration-150 motion-reduce:transition-none"
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
