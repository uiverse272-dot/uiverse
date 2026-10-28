import { describe, expect, it } from "vitest";
import { checkConfig, missing } from "./config";

const READY = {
  DATABASE_URL: "postgresql://postgres.abc:pw@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
  BETTER_AUTH_SECRET: "k3M9yJ0r1x8m7Q2pA6sV4nB5cD8eF0gH1iJ2kL3mN4o=",
  RESEND_API_KEY: "re_123",
  AUTH_EMAIL_FROM: "Uiverse <hello@uiverse.tech>",
  TAKEDOWN_EMAIL_TO: "info@uiverse.tech",
  TAKEDOWN_EMAIL_FROM: "Uiverse <takedown@uiverse.tech>",
  NEXT_PUBLIC_SITE_URL: "https://uiverse.tech",
};
const ids = (env: Record<string, string>) => missing(checkConfig(env)).map((c) => c.id);
const check = (env: Record<string, string>, id: string) => checkConfig(env).find((c) => c.id === id)!;

describe("checkConfig", () => {
  it("passes a complete production environment", () => {
    expect(ids(READY)).toEqual([]);
    expect(checkConfig(READY).every((c) => c.ok || c.id === "captures-url")).toBe(true);
  });

  it("names everything required on an empty environment", () => {
    expect(ids({})).toEqual(["database", "auth-secret", "sign-in", "takedown"]);
  });

  it("never echoes a value", () => {
    const text = JSON.stringify(checkConfig({ ...READY, DATABASE_URL: "mysql://secret-host", BETTER_AUTH_SECRET: "shortsecret" }));
    expect(text).not.toContain("secret-host");
    expect(text).not.toContain("shortsecret");
  });

  it("rejects a short auth secret", () => {
    expect(ids({ ...READY, BETTER_AUTH_SECRET: "abc" })).toEqual(["auth-secret"]);
  });

  it("accepts Google or GitHub instead of email sign-in", () => {
    const noEmail = { ...READY, RESEND_API_KEY: "", AUTH_EMAIL_FROM: "", TAKEDOWN_WEBHOOK_URL: "https://hooks.example/t" };
    expect(ids(noEmail)).toEqual(["sign-in"]);
    expect(ids({ ...noEmail, GITHUB_CLIENT_ID: "a", GITHUB_CLIENT_SECRET: "b" })).toEqual([]);
  });

  it("flags an OAuth ID without its secret", () => {
    expect(ids({ ...READY, GOOGLE_CLIENT_ID: "a" })).toEqual(["oauth-pairs"]);
  });

  it("flags a sender that isn't an address", () => {
    expect(ids({ ...READY, AUTH_EMAIL_FROM: "Uiverse" })).toEqual(["auth-email-from"]);
  });

  it("takes a webhook or Resend email as the takedown inbox", () => {
    const none = { ...READY, TAKEDOWN_EMAIL_TO: "" };
    expect(ids(none)).toEqual(["takedown"]);
    expect(ids({ ...none, TAKEDOWN_WEBHOOK_URL: "https://hooks.example/t" })).toEqual([]);
  });

  it("advises the pooler for a direct Supabase connection, and says nothing for other hosts", () => {
    expect(check({ ...READY, DATABASE_URL: "postgresql://postgres:pw@db.abc.supabase.co:5432/postgres" }, "database-pooler").ok).toBe(false);
    expect(check({ ...READY, DATABASE_URL: "postgres://u:p@db.internal:5432/app" }, "database-pooler").ok).toBe(true);
  });

  it("wants the site address as a bare https origin, or Vercel's production domain", () => {
    expect(check({ ...READY, NEXT_PUBLIC_SITE_URL: "http://uiverse.tech" }, "site-url").ok).toBe(false);
    expect(check({ ...READY, NEXT_PUBLIC_SITE_URL: "https://uiverse.tech/" }, "site-url").ok).toBe(true);
    expect(check({ ...READY, NEXT_PUBLIC_SITE_URL: "", VERCEL_PROJECT_PRODUCTION_URL: "uiverse.vercel.app" }, "site-url").ok).toBe(true);
  });
});
