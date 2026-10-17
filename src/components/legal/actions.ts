"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { ITEMS } from "@/lib/data";
import { clientIp, rateLimiter } from "@/lib/rateLimit";
import { isDomain, isEmail, normalizeDomain, onDomain } from "@/lib/domain";
import { deliver } from "@/lib/takedown";

export type Field = "domain" | "name" | "email" | "confirm";
/* a field's name, or a problem with the whole request — the form words it in its own language */
export type TakedownError = Field | "rate" | "failed";
export type Values = { domain: string; name: string; email: string; role: "owner" | "agent"; details: string; confirm: boolean };
export type TakedownState =
  | { status: "idle" }
  | { status: "error"; error: TakedownError; minutes?: number; values: Values }
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
  const fail = (error: TakedownError, minutes?: number): TakedownState => ({ status: "error", error, minutes, values });

  const domain = normalizeDomain(values.domain);
  if (!isDomain(domain)) return fail("domain");
  if (!values.name) return fail("name");
  if (!isEmail(values.email)) return fail("email");
  if (!values.confirm) return fail("confirm");

  const held = ITEMS.filter((i) => i.kind === "screen" && i.capture && onDomain(i.source.domain, domain));
  const ref = newRef();
  const sent: TakedownState = { status: "sent", ref, domain, email: values.email, held: held.length };

  /* the hidden field is only ever filled by bots — tell them it worked and send nothing */
  if (str(form, "website", 200)) return sent;

  const wait = limit(clientIp(await headers()));
  if (wait !== null) return fail("rate", Math.ceil(wait / 60));

  const ok = await deliver({
    ref,
    domain,
    name: values.name,
    email: values.email,
    role: values.role,
    details: values.details,
    held: held.map((i) => i.slug),
    receivedAt: new Date().toISOString(),
  });
  return ok ? sent : fail("failed");
}
