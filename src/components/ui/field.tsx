/** The text input every form uses; margins are the caller's. Red edge when aria-invalid. */
export const FIELD =
  "h-11 w-full border border-border bg-bg-subtle px-3.5 text-[14px] outline-none placeholder:text-text-3 focus:border-border-strong aria-[invalid=true]:border-danger";

/** ——— or ——— between two ways of doing the same thing */
export function OrDivider({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-[12.5px] text-text-3 ${className}`}>
      <span className="h-px flex-1 bg-border" /> {label} <span className="h-px flex-1 bg-border" />
    </div>
  );
}
