"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useI18n } from "@/i18n/client";
import { itemTitle } from "@/i18n/content";
import { fill, num } from "@/i18n/format";
import type { Item } from "@/lib/data";
import {
  buildPrompt, estimateTokens, DEFAULT_OPTIONS, STACKS, TOOLS,
  type PromptOptions, type StackId, type ToolId,
} from "@/lib/prompt";
import { SaveButton } from "../save/SaveButton";
import { Check, Close, Copy, Sparkle } from "../ui/icons";
import { useFocusTrap } from "../ui/useFocusTrap";
import { guideEvent } from "../guide/events";
import { consume, FREE_LIMIT, isCharged, readUsed, reset } from "./quota";

export function PromptDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const { lang, t } = useI18n();
  const pt = t.prompt;
  const [opts, setOpts] = useState<PromptOptions>(DEFAULT_OPTIONS);
  const [used, setUsed] = useState(() => readUsed());
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(() => buildPrompt(item, opts), [item, opts]);
  const text = edited ?? generated;
  /* one credit per distinct prompt — edits and re-copies of a paid prompt are free (see quota.ts) */
  const key = `${item.slug}|${JSON.stringify(opts)}`;
  const charged = isCharged(key);
  const locked = used >= FREE_LIMIT && !charged;
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(dialog);
  useEffect(() => {
    guideEvent("prompt-open");
    return () => guideEvent("prompt-close");
  }, []);

  useEffect(() => {
    /* capture on window runs before the detail overlay's listener, so Escape closes only this dialog */
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const set = <K extends keyof PromptOptions>(k: K, v: PromptOptions[K]) => {
    setOpts((o) => ({ ...o, [k]: v }));
    setEdited(null); // regenerating replaces manual edits
  };

  const copy = () => {
    if (locked) return;
    navigator.clipboard?.writeText(text).then(() => {
      setUsed(consume(key));
      setCopied(true);
      guideEvent("prompt-copy");
      setTimeout(() => setCopied(false), 1400);
    }, () => {});
  };

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--overlay)] p-0 md:p-6"
    >
      {/* backdrop click target for the mouse; keyboard users have the header Close and Escape */}
      <button aria-hidden tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="anim-sheet relative flex h-full w-full max-w-[1020px] flex-col overflow-hidden border border-border bg-bg md:h-[min(720px,90vh)] md:">
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <Sparkle size={16} className="text-text-3" />
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[14px] font-semibold tracking-[-0.015em]">
              {pt.title}
            </h2>
            <p className="truncate text-[12px] text-text-3">
              {itemTitle(item, lang)} · <bdi>{item.source.name}</bdi>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="flex h-8 w-8 items-center justify-center text-text-2 hover:bg-bg-subtle hover:text-text"
          >
            <Close size={16} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* ------------------------------------------------------- options */}
          <div className="shrink-0 overflow-y-auto border-border p-4 md:w-[264px] md:border-e">
            <Group label={pt.target}>
              <div className="space-y-0.5">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => set("tool", tool.id as ToolId)}
                    className={`w-full px-2 py-1.5 text-start transition-colors ${
                      opts.tool === tool.id ? "bg-accent text-accent-fg" : "hover:bg-bg-subtle"
                    }`}
                  >
                    <span className="block text-[13px] font-medium">{tool.name}</span>
                    <span className={`block truncate text-[11px] ${opts.tool === tool.id ? "opacity-70" : "text-text-3"}`}>
                      {pt.hints[tool.id]}
                    </span>
                  </button>
                ))}
              </div>
            </Group>

            <Group label={pt.stack}>
              <div className="flex flex-wrap gap-1.5">
                {STACKS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => set("stack", s.id as StackId)}
                    className={`border px-2 py-1.5 text-[12.5px] font-medium transition-colors ${
                      opts.stack === s.id ? "border-border bg-accent text-accent-fg" : "border-border hover:bg-bg-subtle"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </Group>

            <Group label={pt.include}>
              <div className="space-y-0.5">
                {(["includeSections", "includeTokens", "includeType", "includeLayout", "includeA11y"] as const).map((k) => (
                  <label
                    key={k}
                    className="flex cursor-pointer items-center gap-2.5 px-2 py-1.5 text-[12.5px] hover:bg-bg-subtle"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                        opts[k] ? "border-border bg-accent text-accent-fg" : "border-border-strong"
                      }`}
                    >
                      {opts[k] ? <Check size={11} /> : null}
                    </span>
                    <input
                      type="checkbox"
                      checked={opts[k]}
                      onChange={(e) => set(k, e.target.checked)}
                      className="sr-only"
                    />
                    {pt.includes[k]}
                  </label>
                ))}
              </div>
            </Group>
          </div>

          {/* -------------------------------------------------------- output */}
          <div className="flex min-h-0 flex-1 flex-col">
            {locked ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <h3 className="text-[15px] font-semibold">{fill(pt.usedAll, { n: FREE_LIMIT })}</h3>
                <p className="max-w-sm text-[13.5px] leading-relaxed text-text-2">{pt.proBody}</p>
                <Link
                  href="/pricing"
                  className="mt-1 bg-accent px-4 py-2.5 text-[13.5px] font-medium text-accent-fg"
                >
                  {pt.seePro}
                </Link>
                <button
                  onClick={() => {
                    reset();
                    setUsed(0);
                  }}
                  className="text-[12px] text-text-3 underline underline-offset-2 hover:text-text"
                >
                  {pt.resetDemo}
                </button>
              </div>
            ) : (
              /* the prompt is English for every page language — coding tools follow it best */
              <textarea
                dir="ltr"
                lang="en"
                value={text}
                onChange={(e) => setEdited(e.target.value)}
                spellCheck={false}
                className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-[12px] leading-relaxed outline-none"
              />
            )}

            <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border px-4 py-3">
              <span className="text-[11.5px] text-text-3">
                {fill(pt.tokens, { n: num(estimateTokens(text)) })} ·{" "}
                {charged ? pt.alreadyCounted : fill(pt.left, { left: Math.max(0, FREE_LIMIT - used), limit: FREE_LIMIT })}
                {pt.english ? <span className="block">{pt.english}</span> : null}
              </span>
              <span className="ms-auto flex items-center gap-2">
                <SaveButton slug={item.slug} variant="inline" />
                <button
                  onClick={copy}
                  data-guide="prompt-copy"
                  disabled={locked}
                  className="inline-flex h-9 items-center gap-1.5 bg-accent px-3.5 text-[13.5px] font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? t.common.copied : pt.copyPrompt}
                </button>
              </span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-4">
      <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-3">{label}</div>
      {children}
    </div>
  );
}
