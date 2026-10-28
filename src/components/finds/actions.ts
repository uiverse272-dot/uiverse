"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { isEmail } from "@/lib/domain";
import { isFindTag, submissionText, type FindTag, type Submission } from "@/lib/finds";
import { sendToInbox } from "@/lib/inbox";
import { clientIp, rateLimiter } from "@/lib/rateLimit";

export type FindField = "title" | "creator" | "email" | "url" | "imageUrl" | "creatorUrl" | "confirm";
/* a field's name, or a problem with the whole submission — the form words it in its own language */
export type FindError = FindField | "rate" | "failed";
export type FindValues = { title: string; creator: string; email: string; url: string; imageUrl: string; creatorUrl: string; tags: FindTag[]; note: string; confirm: boolean };
export type FindState =
  | { status: "idle" }
  | { status: "error"; error: FindError; minutes?: number; values: FindValues }
  | { status: "sent"; ref: string; email: string };

/* a designer sends a few of these; a script sends hundreds */
const limit = rateLimiter(5, 60 * 60_000);

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
/* a public web address — the work, its image, the creator's page */
const isWebUrl = (s: string) => {
  try {
    const u = new URL(s);
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
  } catch {
    return false;
  }
};
const newRef = () => `FD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;

export async function submitFind(_prev: FindState, form: FormData): Promise<FindState> {
  const values: FindValues = {
    title: str(form, "title", 120),
    creator: str(form, "creator", 120),
    email: str(form, "email", 200),
    url: str(form, "url", 500),
    imageUrl: str(form, "imageUrl", 500),
    creatorUrl: str(form, "creatorUrl", 500),
    tags: form.getAll("tags").map(String).filter(isFindTag).slice(0, 4),
    note: str(form, "note", 1000),
    confirm: form.get("confirm") === "on",
  };
  const fail = (error: FindError, minutes?: number): FindState => ({ status: "error", error, minutes, values });

  if (!values.title) return fail("title");
  if (!values.creator) return fail("creator");
  if (!isEmail(values.email)) return fail("email");
  if (!isWebUrl(values.url)) return fail("url");
  if (!isWebUrl(values.imageUrl)) return fail("imageUrl");
  if (values.creatorUrl && !isWebUrl(values.creatorUrl)) return fail("creatorUrl");
  if (!values.confirm) return fail("confirm");

  const ref = newRef();
  const sent: FindState = { status: "sent", ref, email: values.email };

  /* the hidden field is only ever filled by bots — tell them it worked and send nothing */
  if (str(form, "website", 200)) return sent;

  const wait = limit(clientIp(await headers()));
  if (wait !== null) return fail("rate", Math.ceil(wait / 60));

  const { confirm: _confirmed, ...rest } = values;
  const s: Submission = { ...rest, creatorUrl: values.creatorUrl || values.url, ref, receivedAt: new Date().toISOString() };
  const ok = await sendToInbox({
    kind: "finds",
    ref,
    subject: `Finds ${ref}: ${s.title} by ${s.creator}`,
    text: submissionText(s),
    replyTo: s.email,
    record: s,
    devFile: ".finds/submissions.jsonl",
  });
  return ok ? sent : fail("failed");
}
