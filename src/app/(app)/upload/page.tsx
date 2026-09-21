import { Shell, PageHeader } from "@/components/feed/Section";
import { Sparkle } from "@/components/ui/icons";

/** One screen, progressive disclosure. The URL path is the default — see docs/10 §4.6. */
export default function UploadPage() {
  return (
    <Shell wide={false}>
      <PageHeader
        title="Submit a design"
        sub="Paste a URL and the capture pipeline does the rest: three viewports, block segmentation, colour and type extraction, then suggested metadata for you to confirm."
      />

      <div className="space-y-4 py-8">
        <div className="rounded-[12px] border border-border bg-surface p-5">
          <label className="text-[13px] font-semibold">Site or app URL</label>
          <input
            placeholder="https://"
            className="mt-2.5 h-11 w-full rounded-[9px] border border-border bg-bg-subtle px-3.5 text-[14px] outline-none placeholder:text-text-3 focus:border-border-strong"
          />
          <div className="mt-3 flex items-center gap-2 text-[12.5px] text-text-3">
            <span className="h-px flex-1 bg-border" /> or drop an image <span className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-3 grid h-28 place-items-center rounded-[10px] border border-dashed border-border text-[13px] text-text-3">
            Drop a PNG, JPG or MP4
          </div>
        </div>

        <div className="rounded-[12px] border border-border bg-surface p-5">
          <div className="flex items-center gap-2 pb-1">
            <Sparkle size={15} className="text-text-3" />
            <h3 className="text-[13px] font-semibold">Suggested metadata</h3>
            <span className="text-[11.5px] text-text-3">editable, never a black box</span>
          </div>
          <p className="pb-4 text-[13px] text-text-2">
            Everything below arrives pre-filled as removable chips. You confirm; you never fill a form.
          </p>
          {[
            ["Type", ["Landing page", "SaaS"]],
            ["Industry", ["Fintech"]],
            ["Style", ["Dark", "Minimal"]],
            ["Components found", ["Navbar", "Hero", "Logo cloud", "Pricing", "Footer"]],
            ["Stack detected", ["Next.js", "Tailwind"]],
          ].map(([label, chips]) => (
            <div key={label as string} className="flex flex-wrap items-center gap-2 border-t border-border py-2.5">
              <span className="w-36 shrink-0 text-[12.5px] text-text-3">{label as string}</span>
              {(chips as string[]).map((c) => (
                <span key={c} className="rounded-[6px] border border-border bg-bg-subtle px-2 py-1 text-[12px] font-medium">
                  {c} ✕
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="rounded-[12px] border border-border bg-surface p-5">
          <h3 className="pb-2 text-[13px] font-semibold">Attribution</h3>
          <p className="text-[13px] leading-relaxed text-text-2">
            Every submission carries the source and a link to it. Code may only be attached when you are its
            author or it is published under a licence — captures of third-party sites never carry their markup.
          </p>
        </div>

        <button className="h-11 w-full rounded-[9px] bg-accent text-[14px] font-medium text-accent-fg">
          Submit for review
        </button>
        <p className="text-center text-[12px] text-text-3">Usually reviewed within 24 hours.</p>
      </div>
    </Shell>
  );
}
