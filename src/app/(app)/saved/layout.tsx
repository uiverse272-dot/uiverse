import type { Metadata } from "next";

/* the page is a client component, which can't export metadata itself */
export const metadata: Metadata = { title: "Saved" };

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
