"use client";

import { useEffect } from "react";
import { Link, useI18n } from "@/i18n/client";
import { LogoMark } from "./Sidebar";

/** A page that threw, said in the page's language, with a retry. The route error.tsx files render it. */
export function ErrorView({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <LogoMark size={56} className="mx-auto mb-5" />
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{t.error.title}</h1>
        <p className="mx-auto mt-2 max-w-[420px] text-[14px] text-text-2">{t.error.body}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button onClick={retry} className="h-10 bg-accent px-4 text-[13.5px] font-medium text-accent-fg hover:brightness-105">
            {t.error.retry}
          </button>
          <Link href="/" className="inline-flex h-10 items-center border border-border px-4 text-[13.5px] font-medium hover:bg-bg-subtle">
            {t.error.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
