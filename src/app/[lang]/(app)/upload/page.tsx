import type { Metadata } from "next";
import { Shell, PageHeader } from "@/components/feed/Section";
import { FIELD, OrDivider } from "@/components/ui/field";
import { Sparkle } from "@/components/ui/icons";
import { Link } from "@/i18n/client";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.upload.title };
}

/** One screen, progressive disclosure. The URL path is the default — see docs/10 §4.6. */
export default async function UploadPage() {
  const { t } = await getI18n();
  const u = t.upload;
  return (
    <Shell wide={false}>
      <PageHeader title={u.title} sub={u.sub} />

      <div className="space-y-4 py-8">
        <div className="border border-border bg-surface p-5">
          <label htmlFor="upload-url" className="text-[13px] font-semibold">
            {u.url}
          </label>
          <input
            id="upload-url"
            dir="ltr"
            placeholder="https://"
            className={`mt-2.5 ${FIELD}`}
          />
          <OrDivider label={u.or} className="mt-3" />
          <div className="mt-3 grid h-28 place-items-center border border-dashed border-border text-[13px] text-text-3">
            {u.drop}
          </div>
        </div>

        <div className="border border-border bg-surface p-5">
          <div className="flex items-center gap-2 pb-1">
            <Sparkle size={15} className="text-text-3" />
            <h2 className="text-[13px] font-semibold">{u.suggested}</h2>
            <span className="text-[11.5px] text-text-3">{u.editable}</span>
          </div>
          <p className="pb-4 text-[13px] text-text-2">{u.suggestedBody}</p>
          {u.rows.map(([label, chips]) => (
            <div key={label} className="flex flex-wrap items-center gap-2 border-t border-border py-2.5">
              <span className="w-36 shrink-0 text-[12.5px] text-text-3">{label}</span>
              {chips.map((c) => (
                <span key={c} className="border border-border bg-bg-subtle px-2 py-1 text-[12px] font-medium">
                  {c} ✕
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="border border-border bg-surface p-5">
          <h2 className="pb-2 text-[13px] font-semibold">{u.attribution}</h2>
          <p className="text-[13px] leading-relaxed text-text-2">{u.attributionBody}</p>
        </div>

        <button className="h-11 w-full bg-accent text-[14px] font-medium text-accent-fg">{u.submit}</button>
        <p className="text-center text-[12px] text-text-3">{u.reviewed}</p>
        <p className="border-t border-border pt-4 text-center text-[12.5px] text-text-2">
          {u.similarHint}{" "}
          <Link href="/similar" className="link-ink">
            {u.similarLink}
          </Link>
        </p>
      </div>
    </Shell>
  );
}
