"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fill, plural } from "@/i18n/format";
import { requestTakedown, type Field, type TakedownState } from "./actions";

const input =
  "mt-2 h-11 w-full border border-border bg-bg-subtle px-3.5 text-[14px] outline-none placeholder:text-text-3 focus:border-border-strong aria-[invalid=true]:border-danger";

/** The one-form opt-out from docs/08 §4. `domain` arrives prefilled from a capture's "Request removal" link. */
export function TakedownForm({ domain }: { domain?: string }) {
  /* a new key starts a fresh action state for "Send another request" */
  const [round, setRound] = useState(0);
  return <Request key={round} domain={round ? "" : domain} onAgain={() => setRound((n) => n + 1)} />;
}

function Request({ domain = "", onAgain }: { domain?: string; onAgain: () => void }) {
  const { lang, t } = useI18n();
  const td = t.takedown;
  const [state, action, pending] = useActionState<TakedownState, FormData>(requestTakedown, { status: "idle" });
  const form = useRef<HTMLFormElement>(null);

  /* after a failed submit, put the cursor where the problem is */
  useEffect(() => {
    if (state.status === "error" && state.field) form.current?.querySelector<HTMLElement>(`[name="${state.field}"]`)?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div role="status" className="border border-border bg-surface p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] text-text-3">{td.received}</p>
        <p dir="ltr" className="mt-1 text-start font-mono text-[20px] font-bold">{state.ref}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-text-2">
          {state.held ? plural(td.held, state.held, lang, { domain: state.domain }) : fill(td.nothingHeld, { domain: state.domain })}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-text-2">{fill(td.confirmBy, { email: state.email })}</p>
        <button type="button" onClick={onAgain} className="mt-4 text-[13px] underline underline-offset-2">
          {td.another}
        </button>
      </div>
    );
  }

  const v = state.status === "error" ? state.values : { domain, name: "", email: "", role: "owner", details: "", confirm: false };
  const bad = (f: Field) => state.status === "error" && state.field === f;
  const err = (f: Field) => (bad(f) ? { "aria-invalid": true, "aria-describedby": "takedown-error" } : {});
  /* a field's error sits under that field; only errors about the whole request go at the bottom */
  const fieldError = (f: Field) =>
    bad(f) && state.status === "error" ? (
      <p id="takedown-error" role="alert" className="mt-1.5 text-[12.5px] text-danger">
        {state.message}
      </p>
    ) : null;

  return (
    <form ref={form} action={action} noValidate className="space-y-4 border border-border bg-surface p-5">
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label htmlFor="td-domain" className="text-[13px] font-semibold">
          {td.domain}
        </label>
        <input id="td-domain" name="domain" dir="ltr" defaultValue={v.domain} placeholder="example.com" autoComplete="url" className={input} {...err("domain")} />
        {fieldError("domain")}
        <p className="mt-1.5 text-[12px] text-text-3">{td.domainHint}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="td-name" className="text-[13px] font-semibold">
            {td.name}
          </label>
          <input id="td-name" name="name" defaultValue={v.name} autoComplete="name" className={input} {...err("name")} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="td-email" className="text-[13px] font-semibold">
            {td.email}
          </label>
          <input id="td-email" name="email" type="email" dir="ltr" defaultValue={v.email} autoComplete="email" className={input} {...err("email")} />
          {fieldError("email")}
        </div>
      </div>
      <p className="-mt-2 text-[12px] text-text-3">{td.emailHint}</p>

      <fieldset>
        <legend className="text-[13px] font-semibold">{td.youAre}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            ["owner", td.owner],
            ["agent", td.agent],
          ].map(([value, label]) => (
            <label key={value} className="flex h-11 cursor-pointer items-center gap-2.5 border border-border bg-bg-subtle px-3.5 text-[13.5px] has-[:checked]:border-border-strong has-[:checked]:bg-surface">
              <input type="radio" name="role" value={value} defaultChecked={v.role === value} className="accent-[var(--accent-ink)]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="td-details" className="text-[13px] font-semibold">
          {td.details} <span className="font-normal text-text-3">({t.common.optional})</span>
        </label>
        <textarea
          id="td-details"
          name="details"
          defaultValue={v.details}
          rows={3}
          maxLength={2000}
          className={`${input} h-auto py-2.5 leading-relaxed`}
        />
      </div>

      {/* off-screen, unlabeled for people — only bots fill it */}
      <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text-2">
        <input type="checkbox" name="confirm" defaultChecked={v.confirm} className="mt-1 accent-[var(--accent-ink)]" {...err("confirm")} />
        {td.confirm}
      </label>
      {fieldError("confirm")}

      {state.status === "error" && !state.field ? (
        <p id="takedown-error" role="alert" className="border border-danger px-3.5 py-2.5 text-[13px] text-danger">
          {state.message}
        </p>
      ) : null}

      <button disabled={pending} className="h-11 w-full bg-accent text-[14px] font-medium text-accent-fg disabled:opacity-60">
        {pending ? td.sending : td.send}
      </button>
    </form>
  );
}
