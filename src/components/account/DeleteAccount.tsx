"use client";

import { useState } from "react";
import { Link, useI18n } from "@/i18n/client";
import { localize } from "@/i18n/config";
import { authClient } from "@/lib/auth-client";
import * as saves from "../save/store";
import { FIELD } from "../ui/field";

/**
 * Deleting is two steps and a typed confirmation, because it can't be undone. The server deletes
 * the user and everything hanging off it (lib/auth); this browser then drops its copies too.
 * A session older than an hour is refused by the server — the person signs in again first.
 */
export function DeleteAccount({ email }: { email: string }) {
  const { lang, t } = useI18n();
  const a = t.auth;
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<"fresh" | "failed" | null>(null);
  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  const remove = async () => {
    setPending(true);
    setError(null);
    const { error: err } = await authClient.deleteUser();
    if (err) {
      setPending(false);
      setError(err.code === "SESSION_EXPIRED" || /re-?authenticate/i.test(err.message ?? "") ? "fresh" : "failed");
      return;
    }
    saves.signOut();
    window.location.assign(localize(lang, "/u/me?deleted=1"));
  };

  return (
    <section className="mt-10 border border-danger/60 p-5">
      <h2 className="text-[15px] font-bold">{a.deleteTitle}</h2>
      <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-text-2">{a.deleteBody}</p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 h-10 border border-danger px-4 text-[13.5px] font-medium text-danger hover:bg-danger hover:text-white"
        >
          {a.deleteStart}
        </button>
      ) : (
        <div className="mt-4 max-w-md">
          <label htmlFor="delete-confirm" className="text-[13px] font-semibold">
            {a.deleteConfirmLabel}
          </label>
          <input
            id="delete-confirm"
            type="email"
            dir="ltr"
            autoComplete="off"
            placeholder={email}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className={`mt-2 ${FIELD}`}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!matches || pending}
              onClick={remove}
              className="h-10 bg-danger px-4 text-[13.5px] font-medium text-white disabled:opacity-40"
            >
              {pending ? a.deleting : a.deleteConfirm}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTyped("");
                setError(null);
              }}
              className="h-10 border border-border px-4 text-[13.5px] hover:bg-bg-subtle"
            >
              {a.cancel}
            </button>
          </div>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-[13px] text-danger">
          {error === "fresh" ? a.deleteFresh : a.deleteFailed}{" "}
          {error === "fresh" ? (
            <Link href="/sign-in?reauth=1&next=/u/me" className="underline underline-offset-2">
              {a.signInAgain}
            </Link>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
