"use client";

import { ErrorView } from "@/components/shell/ErrorView";

/* a detail opened over the feed threw: the slot renders after the page, so the message covers it as the sheet would */
export default function ModalError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-bg">
      <ErrorView {...props} />
    </div>
  );
}
