import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Not found</h1>
        <p className="mt-2 text-[14px] text-text-2">That page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-[8px] border border-border px-4 py-2 text-[13.5px] font-medium hover:bg-bg-subtle"
        >
          Back to the feed
        </Link>
      </div>
    </div>
  );
}
