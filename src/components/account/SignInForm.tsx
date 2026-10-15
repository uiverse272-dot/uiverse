"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { authClient } from "@/lib/auth-client";

const input =
  "mt-2 h-11 w-full border border-border bg-bg-subtle px-3.5 text-[14px] outline-none placeholder:text-text-3 focus:border-border-strong aria-[invalid=true]:border-danger";
const button = "flex h-11 w-full items-center justify-center gap-2 border border-border text-[14px] font-medium transition-colors";

/** Magic link first (no password to forget), Google and GitHub when the server has their keys. */
export function SignInForm({
  providers,
  next,
  errorUrl,
  linkError,
}: {
  providers: { google: boolean; github: boolean; email: boolean };
  next: string;
  errorUrl: string;
  linkError: boolean;
}) {
  const { t } = useI18n();
  const a = t.auth;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(linkError ? a.linkError : null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError(a.invalid);
    setPending(true);
    setError(null);
    const { error: err } = await authClient.signIn.magicLink({ email: value, callbackURL: next, errorCallbackURL: errorUrl });
    setPending(false);
    if (err) setError(a.failed);
    else setSent(value);
  };

  if (sent) {
    return (
      <div role="status" className="border border-border bg-surface p-5">
        <p className="text-[15px] font-bold">{a.sent}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-text-2">{fill(a.sentBody, { email: sent })}</p>
        <button type="button" onClick={() => setSent(null)} className="mt-4 text-[13px] underline underline-offset-2">
          {a.another}
        </button>
      </div>
    );
  }

  const social = (["google", "github"] as const).filter((p) => providers[p]);
  return (
    <div className="space-y-4 border border-border bg-surface p-5">
      {social.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => authClient.signIn.social({ provider: p, callbackURL: next, errorCallbackURL: errorUrl })}
          className={`${button} bg-bg hover:bg-bg-subtle`}
        >
          {a[p]}
        </button>
      ))}
      {social.length && providers.email ? (
        <div className="flex items-center gap-2 text-[12.5px] text-text-3">
          <span className="h-px flex-1 bg-border" /> {a.or} <span className="h-px flex-1 bg-border" />
        </div>
      ) : null}
      {providers.email ? (
        <form onSubmit={send} noValidate>
          <label htmlFor="signin-email" className="text-[13px] font-semibold">
            {a.email}
          </label>
          <input
            id="signin-email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error === a.invalid || undefined}
            aria-describedby={error ? "signin-error" : undefined}
            className={input}
          />
          <button disabled={pending} className={`${button} mt-3 bg-accent text-accent-fg disabled:opacity-60`}>
            {pending ? a.sending : a.send}
          </button>
          <p className="mt-2 text-[12px] text-text-3">{a.linkHint}</p>
        </form>
      ) : null}
      {error ? (
        <p id="signin-error" role="alert" className="border border-danger px-3.5 py-2.5 text-[13px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
