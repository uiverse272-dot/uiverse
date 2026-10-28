"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { FIND_TAGS, tagName } from "@/lib/finds";
import { FIELD } from "../ui/field";
import { submitFind, type FindField, type FindState } from "./actions";

const input = `mt-2 ${FIELD}`;

/** A creator sends their own work for Finds (lib/finds.ts). Same shape as the takedown form. */
export function SubmitForm() {
  /* a new key starts a fresh action state for "Submit another piece" */
  const [round, setRound] = useState(0);
  return <Submit key={round} onAgain={() => setRound((n) => n + 1)} />;
}

function Submit({ onAgain }: { onAgain: () => void }) {
  const { lang, t } = useI18n();
  const f = t.finds.form;
  const [state, action, pending] = useActionState<FindState, FormData>(submitFind, { status: "idle" });
  const form = useRef<HTMLFormElement>(null);

  const field = state.status === "error" && state.error !== "rate" && state.error !== "failed" ? state.error : undefined;
  const message = state.status === "error" ? fill(f.errors[state.error], { n: state.minutes ?? 0 }) : "";

  /* after a failed submit, put the cursor where the problem is */
  useEffect(() => {
    if (field) form.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  }, [state, field]);

  if (state.status === "sent") {
    return (
      <div role="status" className="border border-border bg-surface p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] text-text-3">{f.received}</p>
        <p dir="ltr" className="mt-1 text-start font-mono text-[20px] font-bold">{state.ref}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-text-2">{fill(f.thanks, { email: state.email })}</p>
        <button type="button" onClick={onAgain} className="mt-4 text-[13px] underline underline-offset-2">
          {f.another}
        </button>
      </div>
    );
  }

  const v =
    state.status === "error"
      ? state.values
      : { title: "", creator: "", email: "", url: "", imageUrl: "", creatorUrl: "", tags: [] as string[], note: "", confirm: false };
  const err = (x: FindField) => (field === x ? { "aria-invalid": true, "aria-describedby": "find-error" } : {});
  /* a field's error sits under that field; only errors about the whole submission go at the bottom */
  const fieldError = (x: FindField) =>
    field === x ? (
      <p id="find-error" role="alert" className="mt-1.5 text-[12.5px] text-danger">
        {message}
      </p>
    ) : null;
  const text = (name: FindField, label: string, hint?: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`fd-${name}`} className="text-[13px] font-semibold">
        {label}
      </label>
      <input id={`fd-${name}`} name={name} defaultValue={v[name as keyof typeof v] as string} className={input} {...props} {...err(name)} />
      {fieldError(name)}
      {hint ? <p className="mt-1.5 text-[12px] text-text-3">{hint}</p> : null}
    </div>
  );
  const link = { type: "url", dir: "ltr", placeholder: "https://" } as const;

  return (
    <form ref={form} action={action} noValidate className="space-y-4 border border-border bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {text("title", f.title)}
        {text("creator", f.creator, undefined, { autoComplete: "name" })}
      </div>
      {text("email", f.email, f.emailHint, { type: "email", dir: "ltr", autoComplete: "email" })}
      {text("url", f.url, f.urlHint, link)}
      {text("imageUrl", f.imageUrl, f.imageHint, link)}
      <div>
        <label htmlFor="fd-creatorUrl" className="text-[13px] font-semibold">
          {f.creatorUrl} <span className="font-normal text-text-3">({t.common.optional})</span>
        </label>
        <input id="fd-creatorUrl" name="creatorUrl" defaultValue={v.creatorUrl} className={input} {...link} {...err("creatorUrl")} />
        {fieldError("creatorUrl")}
        <p className="mt-1.5 text-[12px] text-text-3">{f.creatorHint}</p>
      </div>

      <fieldset>
        <legend className="text-[13px] font-semibold">
          {f.tags} <span className="font-normal text-text-3">{f.tagsHint}</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {FIND_TAGS.map((tag) => (
            <label
              key={tag.slug}
              className="flex h-9 cursor-pointer items-center gap-2 border border-border bg-bg-subtle px-3 text-[13px] has-[:checked]:border-border-strong has-[:checked]:bg-surface"
            >
              <input type="checkbox" name="tags" value={tag.slug} defaultChecked={v.tags.includes(tag.slug)} className="accent-[var(--accent-ink)]" />
              {tagName(tag.slug, lang)}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="fd-note" className="text-[13px] font-semibold">
          {f.note} <span className="font-normal text-text-3">({t.common.optional})</span>
        </label>
        <textarea id="fd-note" name="note" defaultValue={v.note} rows={3} maxLength={1000} className={`${input} h-auto py-2.5 leading-relaxed`} />
      </div>

      {/* off-screen, unlabeled for people — only bots fill it */}
      <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text-2">
        <input type="checkbox" name="confirm" defaultChecked={v.confirm} className="mt-1 accent-[var(--accent-ink)]" {...err("confirm")} />
        {f.confirm}
      </label>
      {fieldError("confirm")}

      {state.status === "error" && !field ? (
        <p id="find-error" role="alert" className="border border-danger px-3.5 py-2.5 text-[13px] text-danger">
          {message}
        </p>
      ) : null}

      <button disabled={pending} className="h-11 w-full bg-accent text-[14px] font-medium text-accent-fg disabled:opacity-60">
        {pending ? f.sending : f.send}
      </button>
    </form>
  );
}
