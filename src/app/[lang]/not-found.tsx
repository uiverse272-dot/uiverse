import { LogoMark } from "@/components/shell/Sidebar";
import { Link } from "@/i18n/client";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <LogoMark size={56} className="mx-auto mb-5" />
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{t.notFound.title}</h1>
        <p className="mt-2 text-[14px] text-text-2">{t.notFound.body}</p>
        <Link
          href="/"
          className="mt-5 inline-block border border-border px-4 py-2 text-[13.5px] font-medium hover:bg-bg-subtle"
        >
          {t.notFound.back}
        </Link>
      </div>
    </div>
  );
}
