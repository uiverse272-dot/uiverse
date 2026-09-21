"use client";

import { useEffect, useMemo, useState } from "react";
import type { Item } from "@/lib/data";
import {
  buildPrompt, estimateTokens, DEFAULT_OPTIONS, STACKS, TOOLS,
  type PromptOptions, type StackId, type ToolId,
} from "@/lib/prompt";
import { SaveButton } from "../save/SaveButton";
import { Check, Close, Copy, Sparkle } from "../ui/icons";
import { consume, FREE_LIMIT, readUsed, reset } from "./quota";

export function PromptDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const [opts, setOpts] = useState<PromptOptions>(DEFAULT_OPTIONS);
  const [used, setUsed] = useState(() => readUsed());
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(() => buildPrompt(item, opts), [item, opts]);
  const text = edited ?? generated;
  const locked = used >= FREE_LIMIT;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
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
      setUsed(consume());
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }, () => {});
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--overlay)] p-0 backdrop-blur-[2px] md:p-6">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="anim-sheet relative flex h-full w-full max-w-[1020px] flex-col overflow-hidden border border-border bg-bg md:h-[min(720px,90vh)] md:rounded-[16px]">
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <Sparkle size={16} className="text-text-3" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-semibold tracking-[-0.015em]">Generate implementation prompt</h2>
            <p className="truncate text-[12px] text-text-3">
              {item.title} · {item.source.name}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-text-2 hover:bg-bg-subtle hover:text-text"
          >
            <Close size={16} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* ------------------------------------------------------- options */}
          <div className="shrink-0 overflow-y-auto border-border p-4 md:w-[264px] md:border-r">
            <Group label="Target tool">
              <div className="space-y-0.5">
                {TOOLS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => set("tool", t.id as ToolId)}
                    className={`w-full rounded-[7px] px-2 py-1.5 text-left transition-colors ${
                      opts.tool === t.id ? "bg-text text-bg" : "hover:bg-bg-subtle"
                    }`}
                  >
                    <span className="block text-[13px] font-medium">{t.name}</span>
                    <span className={`block truncate text-[11px] ${opts.tool === t.id ? "opacity-70" : "text-text-3"}`}>
                      {t.hint}
                    </span>
                  </button>
                ))}
              </div>
            </Group>

            <Group label="Stack">
              <div className="flex flex-wrap gap-1.5">
                {STACKS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => set("stack", s.id as StackId)}
                    className={`rounded-[7px] border px-2 py-1.5 text-[12.5px] font-medium transition-colors ${
                      opts.stack === s.id ? "border-text bg-text text-bg" : "border-border hover:bg-bg-subtle"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </Group>

            <Group label="Include">
              <div className="space-y-0.5">
                {(
                  [
                    ["includeSections", "Section breakdown"],
                    ["includeTokens", "Colour tokens"],
                    ["includeType", "Type scale"],
                    ["includeLayout", "Layout & responsive"],
                    ["includeA11y", "Accessibility requirements"],
                  ] as const
                ).map(([k, label]) => (
                  <label
                    key={k}
                    className="flex cursor-pointer items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-[12.5px] hover:bg-bg-subtle"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                        opts[k] ? "border-text bg-text text-bg" : "border-border-strong"
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
                    {label}
                  </label>
                ))}
              </div>
            </Group>
          </div>

          {/* -------------------------------------------------------- output */}
          <div className="flex min-h-0 flex-1 flex-col">
            {locked ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <h3 className="text-[15px] font-semibold">You&apos;ve used your {FREE_LIMIT} free prompts this month</h3>
                <p className="max-w-sm text-[13.5px] leading-relaxed text-text-2">
                  Pro removes the limit. Browsing, saving and the Breakdown tab stay unlimited on Free —
                  only generated output is metered.
                </p>
                <a
                  href="/pricing"
                  className="mt-1 rounded-[8px] bg-accent px-4 py-2.5 text-[13.5px] font-medium text-accent-fg"
                >
                  See Pro
                </a>
                <button
                  onClick={() => {
                    reset();
                    setUsed(0);
                  }}
                  className="text-[12px] text-text-3 underline underline-offset-2 hover:text-text"
                >
                  Reset counter (demo only)
                </button>
              </div>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setEdited(e.target.value)}
                spellCheck={false}
                className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-[12px] leading-relaxed outline-none"
              />
            )}

            <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border px-4 py-3">
              <span className="text-[11.5px] text-text-3">
                ~{estimateTokens(text).toLocaleString()} tokens · {FREE_LIMIT - used} of {FREE_LIMIT} left this month
              </span>
              <span className="ml-auto flex items-center gap-2">
                <SaveButton slug={item.slug} variant="inline" />
                <button
                  onClick={copy}
                  disabled={locked}
                  className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-accent px-3.5 text-[13.5px] font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy prompt"}
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
