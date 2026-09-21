import { redirect } from "next/navigation";
import { SOURCES } from "@/lib/data";
import { Shell, PageHeader } from "@/components/feed/Section";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (SOURCES.some((s) => s.slug === handle)) redirect(`/source/${handle}`);

  return (
    <Shell wide={false}>
      <PageHeader
        title="Your profile"
        sub="User and creator are one identity. Sign-in, uploads and creator analytics sit behind this page in the real build — this prototype ships the discovery half."
      />
      <div className="grid gap-4 py-8 sm:grid-cols-2">
        {[
          ["Saved", "/saved", "Everything you kept, plus collections."],
          ["Upload", "/upload", "Paste a URL — we capture and tag it."],
          ["Collections", "/saved", "Boards, sections, private notes."],
          ["Settings", "/pricing", "Plan, profile, notifications."],
        ].map(([label, href, note]) => (
          <Link
            key={label}
            href={href}
            className="rounded-[12px] border border-border bg-surface p-5 transition-colors hover:border-border-strong"
          >
            <div className="text-[14px] font-semibold">{label}</div>
            <div className="mt-1.5 text-[13px] text-text-2">{note}</div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
