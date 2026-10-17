import { Fragment } from "react";
import { Link } from "@/i18n/client";

const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

/**
 * A dictionary string with on-site links written as [text](/path) — the legal docs and the note
 * under the sign-in form. Only paths on this site; anything else stays plain text.
 */
export function Rich({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    out.push(<Fragment key={`t${last}`}>{text.slice(last, m.index)}</Fragment>);
    out.push(
      <Link key={`a${m.index}`} href={m[2]} className="underline underline-offset-2 hover:text-text">
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  out.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}
