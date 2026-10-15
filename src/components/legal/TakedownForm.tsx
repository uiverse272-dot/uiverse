"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
  const [state, action, pending] = useActionState<TakedownState, FormData>(requestTakedown, { status: "idle" });
  const form = useRef<HTMLFormElement>(null);

  /* after a failed submit, put the cursor where the problem is */
  useEffect(() => {
    if (state.status === "error" && state.field) form.current?.querySelector<HTMLElement>(`[name="${state.field}"]`)?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div role="status" className="border border-border bg-surface p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] text-text-3">Request received</p>
        <p className="mt-1 font-mono text-[20px] font-bold">{state.ref}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-text-2">
          {state.held
            ? `We hold ${state.held} capture${state.held === 1 ? "" : "s"} from ${state.domain}. Everything from the domain — screens, the components cropped from them, palettes, search entries and stored screenshots — will be removed, and it won't be captured again.`
            : `Nothing from ${state.domain} is in the index right now. We'll still block it, so it's never captured.`}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-text-2">
          We&apos;ll confirm at {state.email} within 5 working days. Quote the reference if you write to us.
        </p>
        <button type="button" onClick={onAgain} className="mt-4 text-[13px] underline underline-offset-2">
          Send another request
        </button>
      </div>
    );
  }

  const v = state.status === "error" ? state.values : { domain, name: "", email: "", role: "owner", details: "", confirm: false };
  const bad = (f: Field) => state.status === "error" && state.field === f;
  const err = (f: Field) => (bad(f) ? { "aria-invalid": true, "aria-describedby": "takedown-error" } : {});

  return (
    <form ref={form} action={action} noValidate className="space-y-4 border border-border bg-surface p-5">
      <div>
        <label htmlFor="td-domain" className="text-[13px] font-semibold">
          Domain to remove
        </label>
        <input id="td-domain" name="domain" defaultValue={v.domain} placeholder="example.com" autoComplete="url" className={input} {...err("domain")} />
        <p className="mt-1.5 text-[12px] text-text-3">Covers the domain and its subdomains.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="td-name" className="text-[13px] font-semibold">
            Your name
          </label>
          <input id="td-name" name="name" defaultValue={v.name} autoComplete="name" className={input} {...err("name")} />
        </div>
        <div>
          <label htmlFor="td-email" className="text-[13px] font-semibold">
            Email
          </label>
          <input id="td-email" name="email" type="email" defaultValue={v.email} autoComplete="email" className={input} {...err("email")} />
        </div>
      </div>
      <p className="-mt-2 text-[12px] text-text-3">An address at the domain itself is the quickest to verify.</p>

      <fieldset>
        <legend className="text-[13px] font-semibold">You are</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            ["owner", "The owner or operator"],
            ["agent", "Authorized to act for them"],
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
          Anything else <span className="font-normal text-text-3">(optional)</span>
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
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text-2">
        <input type="checkbox" name="confirm" defaultChecked={v.confirm} className="mt-1 accent-[var(--accent-ink)]" {...err("confirm")} />
        I own or operate this site, or I&apos;m authorized to act for whoever does, and the details above are accurate.
      </label>

      {state.status === "error" ? (
        <p id="takedown-error" role="alert" className="border border-danger px-3.5 py-2.5 text-[13px] text-danger">
          {state.message}
        </p>
      ) : null}

      <button disabled={pending} className="h-11 w-full bg-accent text-[14px] font-medium text-accent-fg disabled:opacity-60">
        {pending ? "Sending…" : "Send removal request"}
      </button>
    </form>
  );
}
