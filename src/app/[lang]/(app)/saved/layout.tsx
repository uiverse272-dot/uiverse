import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";

/* the page is a client component, which can't export metadata itself */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.saved.title };
}

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
