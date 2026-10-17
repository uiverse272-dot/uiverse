import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SOURCES } from "@/lib/data";
import { Shell, PageHeader } from "@/components/feed/Section";
import { Link } from "@/i18n/client";
import { DeleteAccount } from "@/components/account/DeleteAccount";
import { SignOutButton } from "@/components/account/SignOutButton";
import { fillNodes } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { currentUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.profile.title };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { handle } = await params;
  const { deleted } = await searchParams;
  const { t, href } = await getI18n();
  if (SOURCES.some((s) => s.slug === handle)) redirect(href(`/source/${handle}`));
  /* public profiles don't exist yet, so "me" is the only one — anything else would be a fake 200 */
  if (handle !== "me") notFound();
  const user = await currentUser();

  return (
    <Shell wide={false}>
      <PageHeader title={t.profile.title} sub={t.profile.sub} />
      {deleted === "1" && !user ? (
        <p role="status" className="mt-6 border border-border bg-signal/40 p-4 text-[14px] font-medium">
          {t.auth.deleted}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-surface p-5">
        <p className="text-[14px]">
          {user ? (
            fillNodes(t.auth.signedInAs, { email: <bdi className="font-bold">{user.email}</bdi> })
          ) : (
            t.auth.keepSaves
          )}
        </p>
        {user ? (
          <SignOutButton className="h-10 border border-border px-4 text-[13.5px] font-medium hover:bg-bg-subtle" />
        ) : (
          <Link href="/sign-in?next=/u/me" className="inline-flex h-10 items-center bg-accent px-4 text-[13.5px] font-medium text-accent-fg">
            {t.auth.signIn}
          </Link>
        )}
      </div>
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
      {user ? <DeleteAccount email={user.email} /> : null}
    </Shell>
  );
}
