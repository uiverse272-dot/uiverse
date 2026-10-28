import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { sendEmail } from "./email";

/**
 * The operator's inbox: where a takedown request or a Finds submission goes so a person sees it.
 * Nothing is stored — it's sent to a chat webhook, an email, or both. In development with neither
 * configured it's appended to a local file instead; in production that would lose it, so it fails
 * and the form says so.
 *
 *   TAKEDOWN_WEBHOOK_URL   Slack or Discord incoming webhook
 *   RESEND_API_KEY, TAKEDOWN_EMAIL_TO, TAKEDOWN_EMAIL_FROM   email through Resend
 */
export type InboxMessage = {
  /** what it is, for logs: "takedown", "finds" */
  kind: string;
  ref: string;
  subject: string;
  text: string;
  replyTo: string;
  /** the full record, for the development file */
  record: unknown;
  /** where development keeps it, relative to the project (git-ignored) */
  devFile: string;
};

async function toWebhook(url: string, text: string) {
  /* Slack reads `text`, Discord reads `content` (and caps it at 2000 characters) */
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, content: text.slice(0, 2000) }),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
}

/** true when at least one channel took it */
export async function sendToInbox(m: InboxMessage): Promise<boolean> {
  const { TAKEDOWN_WEBHOOK_URL: hook, RESEND_API_KEY: key, TAKEDOWN_EMAIL_TO: to, TAKEDOWN_EMAIL_FROM: from } = process.env;
  const sends: Promise<void>[] = [];
  if (hook) sends.push(toWebhook(hook, m.text));
  if (key && to && from) sends.push(sendEmail({ from, to: to.split(",").map((s) => s.trim()), replyTo: m.replyTo, subject: m.subject, text: m.text }));

  if (!sends.length) {
    if (process.env.NODE_ENV === "production") {
      console.error(`${m.kind} ${m.ref} not delivered: no TAKEDOWN_WEBHOOK_URL or Resend email configured`);
      return false;
    }
    const file = path.join(process.cwd(), m.devFile);
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(file, JSON.stringify(m.record) + "\n");
    console.log(`\n${m.text}\n(saved to ${m.devFile} — set TAKEDOWN_WEBHOOK_URL to deliver it)\n`);
    return true;
  }

  const results = await Promise.allSettled(sends);
  for (const x of results) if (x.status === "rejected") console.error(`${m.kind} ${m.ref}: ${(x.reason as Error).message}`);
  return results.some((x) => x.status === "fulfilled");
}
