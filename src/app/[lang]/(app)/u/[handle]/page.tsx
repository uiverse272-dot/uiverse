import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SOURCES } from "@/lib/data";
import { Shell, PageHeader } from "@/components/feed/Section";
import { Link } from "@/i18n/client";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.profile.title };
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const { t, href } = await getI18n();
  if (SOURCES.some((s) => s.slug === handle)) redirect(href(`/source/${handle}`));
  /* there are no accounts yet, so "me" is the only profile — anything else would be a fake 200 */
  if (handle !== "me") notFound();

  return (
    <Shell wide={false}>
      <PageHeader title={t.profile.title} sub={t.profile.sub} />
      <div className="grid gap-4 py-8 sm:grid-cols-2">
        {t.profile.cards.map(([label, to, note]) => (
          <Link
            key={label}
            href={to}
            className="border border-border bg-surface p-5 transition-colors hover:border-border-strong"
          >
            <div className="text-[14px] font-semibold">{label}</div>
            <div className="mt-1.5 text-[13px] text-text-2">{note}</div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
