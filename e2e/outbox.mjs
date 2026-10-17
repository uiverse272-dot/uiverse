// A change cut off by leaving the page still reaches the account. Run by e2e/run.mjs, which starts the server and passes its address and log.
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";
const [base, serverLog, shots = "e2e/.shots"] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });
let fails = 0;
const log = (ok, m) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"}  ${m}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
async function signedIn(email) {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await c.addInitScript(() => { try { localStorage.setItem("uiv.guide", JSON.stringify({ status: "off", step: 0 })); } catch {} });
  const p = await c.newPage();
  await p.goto(base + "/sign-in", { waitUntil: "networkidle" });
  await p.locator("#signin-email").fill(email);
  await p.locator("form button").click();
  await p.getByRole("status").waitFor();
  await wait(800);
  const link = [...readFileSync(serverLog, "utf8").matchAll(new RegExp(`sign-in link for ${email.replace(/[.+]/g, "\\$&")}:\\n(\\S+)`, "g"))].at(-1)[1];
  await p.goto(link, { waitUntil: "networkidle" });
  await wait(800);
  return p;
}
const state = (p) => p.evaluate(() => {
  const k = Object.keys(localStorage).find((x) => x.startsWith("uiv.saves.u:"));
  const o = Object.keys(localStorage).find((x) => x.startsWith("uiv.saves.outbox:"));
  return { saves: JSON.parse(localStorage.getItem(k) ?? "{}"), outbox: o ? JSON.parse(localStorage.getItem(o)) : [] };
});

const email = `outbox+${Date.now()}@example.com`;
const p = await signedIn(email);

// hold every save request (server actions carry a next-action header) so we can leave mid-flight
let hold = true;
await p.route("**/*", async (route) => {
  const r = route.request();
  if (hold && r.method() === "POST" && r.headers()["next-action"]) {
    await wait(4000);
    return route.continue().catch(() => {});
  }
  return route.continue();
});

await p.goto(base + "/web", { waitUntil: "networkidle" });
const card = p.locator('[data-guide="card"]').filter({ has: p.locator('button[aria-label="Save"]') }).first();
await card.locator('button[aria-label="Save"]').click();
await p.getByRole("button", { name: "Move to…" }).click();
await p.getByPlaceholder("New collection…").fill("Cut off");
await p.keyboard.press("Enter");
await wait(300);
const queued = (await state(p)).outbox.map((o) => o.type);
log(queued.includes("create") && queued.includes("move"), `changes wait in the outbox while unconfirmed (${queued.join(", ")})`);

// leave right away: a full page load cancels the held requests
await p.goto(base + "/explore", { waitUntil: "commit" }).catch(() => {});
hold = false;
await p.unroute("**/*");

// the next visit sends what was left
await p.goto(base + "/saved", { waitUntil: "networkidle" });
await wait(2500);
const after = await state(p);
log(after.outbox.length === 0, `the outbox empties on the next visit (${after.outbox.length} left)`);

// the account itself has it: a fresh browser sees the design in the new collection
const q = await signedIn(email);
await q.goto(base + "/saved", { waitUntil: "networkidle" });
await wait(1000);
const s = (await state(q)).saves;
const board = (s.collections ?? []).find((c) => c.name === "Cut off");
log(!!board && s.saves.some((x) => x.collectionId === board.id), "another device sees the design in “Cut off”");

console.log(fails ? `${fails} FAILED` : "ALL PASSED");
await b.close();
process.exitCode = fails ? 1 : 0;
