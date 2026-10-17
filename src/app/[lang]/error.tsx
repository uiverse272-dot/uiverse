"use client";

import { ErrorView } from "@/components/shell/ErrorView";

/* the shell itself threw (sidebar, nav, guide): no shell, but still the app's language and styles */
export default function ShellError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView {...props} />;
}
