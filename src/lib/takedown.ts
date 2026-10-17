import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { onDomain } from "./domain";
import { sendEmail } from "./email";

/**
 * Delivery for takedown requests (docs/08 §4). A request isn't stored — it's sent where someone
 * will see it — a chat webhook, an email, or both — and the operator honours it with
 * `npm run capture -- --opt-out <domain> --ref <ref>`. In development with neither configured
 * it lands in .takedowns/requests.jsonl; in production that would lose it, so it fails instead
 * and the form says so.
 *
 *   TAKEDOWN_WEBHOOK_URL   Slack or Discord incoming webhook
 *   RESEND_API_KEY, TAKEDOWN_EMAIL_TO, TAKEDOWN_EMAIL_FROM   email through Resend
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

async function toWebhook(url: string, r: TakedownRequest) {
  const text = summary(r);
  /* Slack reads `text`, Discord reads `content` (and caps it at 2000 characters) */
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, content: text.slice(0, 2000) }),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
}

const toEmail = (to: string, from: string, r: TakedownRequest) =>
  sendEmail({ from, to: to.split(",").map((s) => s.trim()), replyTo: r.email, subject: `Takedown ${r.ref}: ${r.domain}`, text: summary(r) });

/** true when at least one channel took it */
export async function deliver(r: TakedownRequest): Promise<boolean> {
  const { TAKEDOWN_WEBHOOK_URL: hook, RESEND_API_KEY: key, TAKEDOWN_EMAIL_TO: to, TAKEDOWN_EMAIL_FROM: from } = process.env;
  const sends: Promise<void>[] = [];
  if (hook) sends.push(toWebhook(hook, r));
  if (key && to && from) sends.push(toEmail(to, from, r));

  if (!sends.length) {
    if (process.env.NODE_ENV === "production") {
      console.error(`takedown ${r.ref} for ${r.domain} not delivered: no TAKEDOWN_WEBHOOK_URL or Resend email configured`);
      return false;
    }
    const dir = path.join(process.cwd(), ".takedowns");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "requests.jsonl"), JSON.stringify(r) + "\n");
    console.log(`\n${summary(r)}\n(saved to .takedowns/requests.jsonl — set TAKEDOWN_WEBHOOK_URL to deliver it)\n`);
    return true;
  }

  const results = await Promise.allSettled(sends);
  for (const x of results) if (x.status === "rejected") console.error(`takedown ${r.ref}: ${(x.reason as Error).message}`);
  return results.some((x) => x.status === "fulfilled");
}
