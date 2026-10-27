// Account deletion, end to end. Run by e2e/run.mjs, which starts the server and passes its address and log.
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";
const [base, serverLog, shots = "e2e/.shots"] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });
let fails = 0;
const log = (ok, m) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"}  ${m}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
async function ctx() {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await c.addInitScript(() => { try { localStorage.setItem("uiv.guide", JSON.stringify({ status: "off", step: 0 })); } catch {} });
  return c;
}
const links = (email) => [...readFileSync(serverLog, "utf8").matchAll(new RegExp(`sign-in link for ${email.replace(/[.+]/g, "\\$&")}:\\n(\\S+)`, "g"))].map((m) => m[1]);
async function request(page, email, path = "/sign-in") {
  const before = links(email).length;
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.locator("#signin-email").fill(email);
  await page.locator("form button").click();
  await page.getByRole("status").waitFor();
  for (let i = 0; i < 40 && links(email).length === before; i++) await wait(250);
  return links(email).at(-1);
}
const accountSaves = (p) => p.evaluate(() => {
  const k = Object.keys(localStorage).find((x) => x.startsWith("uiv.saves.u:"));
  return k ? JSON.parse(localStorage.getItem(k)).saves.length : null;
});

const EMAIL = `del+${Date.now()}@example.com`;
const p = await (await ctx()).newPage();

// sign in and save two designs
await p.goto(await request(p, EMAIL), { waitUntil: "networkidle" });
await p.goto(base + "/web", { waitUntil: "networkidle" });
const save = p.locator('[data-guide="card"] button[aria-label="Save"]');
await save.nth(0).click();
await save.nth(1).click();
await wait(800);
log((await accountSaves(p)) === 2, "signed in with 2 saves");

// an unused link is sitting in the inbox when the account is deleted
const pending = await request(await (await ctx()).newPage(), EMAIL);

// delete: confirm is locked until the address is typed
await p.goto(base + "/u/me", { waitUntil: "networkidle" });
await p.getByRole("button", { name: "Delete my account" }).click();
const confirm = p.getByRole("button", { name: "Delete permanently" });
log(await confirm.isDisabled(), "Delete permanently is locked at first");
await p.locator("#delete-confirm").fill("wrong@example.com");
log(await confirm.isDisabled(), "…and stays locked for the wrong address");
await p.locator("#delete-confirm").fill(EMAIL.toUpperCase());
log(await confirm.isEnabled(), "unlocks for the right address (any case)");
await p.screenshot({ path: `${shots}/delete-confirm.png` });
await confirm.click();
await p.waitForURL(/\/u\/me\?deleted=1/);
log((await p.getByText("Your account, saves, boards and notes have been deleted.").count()) === 1, "lands on a confirmation");
log((await p.getByRole("link", { name: "Sign in" }).count()) >= 1, "and is signed out");
log((await accountSaves(p)) === null, "no account copy left in the browser");
const session = await p.evaluate(() => fetch("/api/auth/get-session").then((r) => r.json()));
log(session === null, "the server has no session for this browser");

// the link that was already in the inbox no longer signs anyone in
const q = await (await ctx()).newPage();
await q.goto(pending, { waitUntil: "networkidle" });
log(new URL(q.url()).pathname === "/sign-in" && (await q.getByRole("alert").count()) >= 1, `an unused link from before deletion is refused (${new URL(q.url()).pathname}${new URL(q.url()).search})`);

// signing in again starts from nothing
const r = await (await ctx()).newPage();
await r.goto(await request(r, EMAIL), { waitUntil: "networkidle" });
await wait(800);
log((await accountSaves(r)) === 0, "signing in again is a fresh account with no saves");
await r.goto(base + "/saved", { waitUntil: "networkidle" });
log((await r.locator('[data-guide="card"]').count()) === 0, "/saved is empty");

// Arabic
await r.goto(base + "/ar/u/me", { waitUntil: "networkidle" });
log((await r.getByRole("button", { name: "احذف حسابي" }).count()) === 1, "the delete section is Arabic at /ar");
await r.getByRole("button", { name: "احذف حسابي" }).click();
await r.screenshot({ path: `${shots}/delete-ar.png` });

console.log(fails ? `${fails} FAILED` : "ALL PASSED");
await b.close();
process.exitCode = fails ? 1 : 0;
