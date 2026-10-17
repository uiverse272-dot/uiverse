"use client";

import { ErrorView } from "@/components/shell/ErrorView";

/* a page threw: the sidebar and nav stay, the page area says so */
export default function PageError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView {...props} />;
}
