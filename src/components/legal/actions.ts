"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { ITEMS } from "@/lib/data";
import { clientIp, rateLimiter } from "@/lib/rateLimit";
import { deliver, isDomain, normalizeDomain } from "@/lib/takedown";

export type Field = "domain" | "name" | "email" | "confirm";
export type Values = { domain: string; name: string; email: string; role: string; details: string; confirm: boolean };
export type TakedownState =
  | { status: "idle" }
  | { status: "error"; message: string; field?: Field; values: Values }
  | { status: "sent"; ref: string; domain: string; email: string; held: number };

/* a person sends one or two of these; a script sends hundreds */
const limit = rateLimiter(5, 60 * 60_000);

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const newRef = () =>
  `TD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;

export async function requestTakedown(_prev: TakedownState, form: FormData): Promise<TakedownState> {
  const values: Values = {
    domain: str(form, "domain", 300),
    name: str(form, "name", 120),
    email: str(form, "email", 200),
    role: form.get("role") === "agent" ? "agent" : "owner",
    details: str(form, "details", 2000),
    confirm: form.get("confirm") === "on",
  };
  const fail = (message: string, field?: Field): TakedownState => ({ status: "error", message, field, values });

  const domain = normalizeDomain(values.domain);
  if (!isDomain(domain)) return fail("Enter the site's domain, like example.com.", "domain");
  if (!values.name) return fail("Add your name.", "name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return fail("Add an email address we can reply to.", "email");
  if (!values.confirm) return fail("Confirm you're the owner or authorized to act for them.", "confirm");

  const held = ITEMS.filter((i) => i.kind === "screen" && i.capture && (i.source.domain === domain || i.source.domain.endsWith(`.${domain}`)));
  const ref = newRef();
  const sent: TakedownState = { status: "sent", ref, domain, email: values.email, held: held.length };

  /* the hidden field is only ever filled by bots — tell them it worked and send nothing */
  if (str(form, "website", 200)) return sent;

  const wait = limit(clientIp(await headers()));
  if (wait !== null) return fail(`Too many requests from this network — try again in ${Math.ceil(wait / 60)} minutes.`);

  const ok = await deliver({
    ref,
    domain,
    name: values.name,
    email: values.email,
    role: values.role === "agent" ? "agent" : "owner",
    details: values.details,
    held: held.map((i) => i.slug),
    receivedAt: new Date().toISOString(),
  });
  return ok ? sent : fail("The request couldn't be sent just now. Please try again in a few minutes.");
}
