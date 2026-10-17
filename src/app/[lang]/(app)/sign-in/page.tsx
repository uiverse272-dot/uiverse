import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/account/SignInForm";
import { PageHeader, Shell } from "@/components/feed/Section";
import { getI18n } from "@/i18n/server";
import { currentUser, getAuth, providers } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.title, robots: { index: false } };
}

/* only paths on this site — an open redirect after sign-in is a phishing gift */
const internal = (p: unknown) => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : undefined);

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { t, href } = await getI18n();
  /* signed in already: off to the profile — unless signing in again on purpose (?reauth=1), which
     deleting an account asks for when the session is older than an hour */
  if (sp.reauth !== "1" && (await currentUser())) redirect(href("/u/me"));
  const enabled = !!(await getAuth());
  const next = internal(sp.next) ?? href("/saved");
  return (
    <Shell wide={false}>
      <div className="mx-auto max-w-md pb-16">
        <PageHeader title={t.auth.title} sub={t.auth.sub} />
        <div className="pt-6">
          {enabled ? (
            <SignInForm
              providers={providers()}
              next={next}
              errorUrl={href("/sign-in?error=link")}
              linkError={typeof sp.error === "string"}
            />
          ) : (
            <p className="border border-border bg-surface p-5 text-[14px] text-text-2">{t.auth.off}</p>
          )}
        </div>
      </div>
    </Shell>
  );
}
