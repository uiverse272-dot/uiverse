import { onDomain } from "./domain";
import { sendToInbox } from "./inbox";

/**
 * Delivery for takedown requests (docs/08 §4). A request isn't stored — it goes to the operator's
 * inbox (lib/inbox.ts: a chat webhook, an email, or both) — and the operator honours it with
 * `npm run capture -- --opt-out <domain> --ref <ref>`. In development with neither configured it
 * lands in .takedowns/requests.jsonl.
 */

export type TakedownRequest = {
  ref: string;
  domain: string;
  name: string;
  email: string;
  role: "owner" | "agent";
  details: string;
  held: string[];
  receivedAt: string;
};

/* not proof — anyone can type any address — but a request from an address at the domain is the quick case */
const emailMatches = (r: TakedownRequest) => onDomain(r.email.split("@")[1]?.toLowerCase() ?? "", r.domain);

function summary(r: TakedownRequest) {
  return [
    `Takedown request ${r.ref}`,
    `Domain: ${r.domain} — ${r.held.length ? `${r.held.length} capture(s) held: ${r.held.join(", ")}` : "nothing held yet; blocks future captures"}`,
    `From: ${r.name} <${r.email}> · ${r.role === "owner" ? "owner / operator" : "authorized agent"} · email at the domain: ${emailMatches(r) ? "yes" : "no"}`,
    r.details ? `Details: ${r.details}` : "",
    `Honour it: npm run capture -- --opt-out ${r.domain} --ref ${r.ref}`,
    `Received ${r.receivedAt}. Reply within 5 working days.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** true when at least one channel took it */
export const deliver = (r: TakedownRequest) =>
  sendToInbox({
    kind: "takedown",
    ref: r.ref,
    subject: `Takedown ${r.ref}: ${r.domain}`,
    text: summary(r),
    replyTo: r.email,
    record: r,
    devFile: ".takedowns/requests.jsonl",
  });
