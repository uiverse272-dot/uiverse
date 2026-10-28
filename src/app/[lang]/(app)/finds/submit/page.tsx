import type { Metadata } from "next";
import { alternates, getI18n } from "@/i18n/server";
import { SubmitForm } from "@/components/finds/SubmitForm";
import { PageHeader, Shell } from "@/components/feed/Section";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.finds.submit, description: t.finds.form.sub, alternates: alternates(lang, "/finds/submit") };
}

export default async function SubmitFindPage() {
  const { t } = await getI18n();
  return (
    <Shell wide={false}>
      <PageHeader title={t.finds.submit} sub={t.finds.form.sub} />
      <div className="max-w-2xl py-8 pb-16">
        <SubmitForm />
      </div>
    </Shell>
  );
}
