"use client";

import { useI18n } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";
import * as saves from "../save/store";

/* a full reload afterwards: every server component that read the session renders as a guest again */
export function SignOutButton({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        /* before the reload, while this page still knows whose copy it holds */
        saves.signOut();
        window.location.reload();
      }}
      className={className}
    >
      {t.auth.signOut}
    </button>
  );
}
