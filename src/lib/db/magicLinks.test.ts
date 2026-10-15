import { eq, sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { openLocal, type Db } from ".";
import { deleteMagicLinks } from "./magicLinks";
import { verification } from "./schema";

let db: Db;
let n = 0;
const link = (email: string, type = "magic-link") =>
  db.insert(verification).values({
    id: `v${++n}`,
    identifier: `${type === "magic-link" ? "magic-link" : "other"}:${n}`,
    value: JSON.stringify({ type, email, name: "" }),
    expiresAt: new Date(Date.now() + 300_000),
  });
const emails = async () => (await db.select({ v: verification.value }).from(verification)).map((r) => JSON.parse(r.v).email);

beforeAll(async () => {
  db = await openLocal();
});

describe("deleteMagicLinks", () => {
  it("removes every unused link for the address, whatever its case, and only those", async () => {
    await link("sara@example.com");
    await link("Sara@Example.com");
    await link("someone@example.com");
    await deleteMagicLinks(db, "SARA@example.com");
    expect(await emails()).toEqual(["someone@example.com"]);
  });

  it("treats _ and % as letters, not wildcards", async () => {
    await link("a_b@example.com");
    await link("axb@example.com");
    await link("a%b@example.com");
    await link("aXYZb@example.com");
    await deleteMagicLinks(db, "a_b@example.com");
    await deleteMagicLinks(db, "a%b@example.com");
    expect((await emails()).sort()).toEqual(["aXYZb@example.com", "axb@example.com", "someone@example.com"].sort());
  });

  it("doesn't touch other kinds of verification for the same address", async () => {
    await link("keep@example.com", "email-verification");
    await deleteMagicLinks(db, "keep@example.com");
    expect(await emails()).toContain("keep@example.com");
  });
});

describe("the local database", () => {
  it("runs in UTC, so stored times read back as written", async () => {
    const { rows } = (await db.execute(sql`show timezone`)) as unknown as { rows: { TimeZone: string }[] };
    const [{ TimeZone }] = rows;
    expect(TimeZone).toBe("UTC");
    const at = new Date(Date.now() - 2 * 3600_000);
    await db.insert(verification).values({ id: "tz", identifier: "tz", value: "{}", expiresAt: at });
    const [row] = await db.select({ expiresAt: verification.expiresAt }).from(verification).where(eq(verification.id, "tz"));
    expect(row.expiresAt.getTime()).toBe(at.getTime());
  });
});
