// Accounts + server saves, end to end. Run by e2e/run.mjs, which starts the server and passes its address and log.
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";
const [base, serverLog, shots = "e2e/.shots"] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });

let fails = 0;
const log = (ok, m) => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${m}`);
};
const errors = [];
const b = await chromium.launch();
async function ctx() {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await c.addInitScript(() => {
    try {
      localStorage.setItem("uiv.guide", JSON.stringify({ status: "off", step: 0 }));
      localStorage.setItem("uiv.pick", "tab");
    } catch {} // about:blank has no storage
  });
  c.on("page", (p) => p.on("pageerror", (e) => errors.push(e.message.slice(0, 160))));
  return c;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/* the newest sign-in link printed for this address */
async function linkFor(email) {
  for (let i = 0; i < 40; i++) {
    const m = [...readFileSync(serverLog, "utf8").matchAll(new RegExp(`sign-in link for ${email.replace(/[.+]/g, "\\$&")}:\\n(\\S+)`, "g"))];
    if (m.length) return m.at(-1)[1];
    await wait(250);
  }
  throw new Error(`no link for ${email}`);
}
const savedSlugs = (p) =>
  p.evaluate(() => {
    const k = Object.keys(localStorage).find((x) => x.startsWith("uiv.saves.u:")) ?? "uiv.saves.v1";
    return (JSON.parse(localStorage.getItem(k) ?? "{}").saves ?? []).map((s) => s.slug);
  });
async function signIn(page, email, path = "/sign-in") {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.locator("#signin-email").fill(email);
  await page.locator("form button").click();
  await page.getByRole("status").waitFor();
  await page.goto(await linkFor(email), { waitUntil: "networkidle" });
}

const EMAIL = `sara+${Date.now()}@example.com`;

// 1. a guest saves two things and makes an Arabic-named collection
const c1 = await ctx();
const p1 = await c1.newPage();
await p1.goto(base + "/web", { waitUntil: "networkidle" });
const saveButtons = p1.locator('[data-guide="card"] button[aria-label="Save"]');
await saveButtons.nth(0).click();
await saveButtons.nth(1).click();
await p1.getByRole("button", { name: "Move to…" }).click();
await p1.getByPlaceholder("New collection…").fill("عملي");
await p1.keyboard.press("Enter");
const guest = await savedSlugs(p1);
log(guest.length === 2, `guest saved 2 items in this browser (${guest.join(", ")})`);
const guestCollections = await p1.evaluate(() => JSON.parse(localStorage.getItem("uiv.saves.v1")).collections.map((c) => c.id));
log(guestCollections.some((id) => /^c\d+$/.test(id)), `an Arabic-named collection gets a usable id (${guestCollections.join(", ")})`);

// 2. sign in with a magic link → lands on Saved, guest saves are now the account's
await signIn(p1, EMAIL);
log(new URL(p1.url()).pathname === "/saved", `the link signs in and lands on Saved (${new URL(p1.url()).pathname})`);
await p1.waitForFunction(() => Object.keys(localStorage).some((k) => k.startsWith("uiv.saves.u:")));
await wait(500);
log(JSON.stringify((await savedSlugs(p1)).sort()) === JSON.stringify([...guest].sort()), "guest saves were merged into the account");
log(await p1.evaluate(() => localStorage.getItem("uiv.saves.v1") === null), "the guest copy is cleared once merged");
log((await p1.getByText("Your saves are in your account").count()) === 1, "Saved says they're synced");
log((await p1.getByRole("button", { name: /عملي/ }).count()) === 1, "the Arabic collection came along");
await p1.screenshot({ path: `${shots}/saved-signed-in.png` });

// 3. a second device signs in to the same account and sees the same saves
const c2 = await ctx();
const p2 = await c2.newPage();
await signIn(p2, EMAIL);
await p2.waitForFunction(() => Object.keys(localStorage).some((k) => k.startsWith("uiv.saves.u:")));
await wait(500);
log(JSON.stringify((await savedSlugs(p2)).sort()) === JSON.stringify([...guest].sort()), "a second device sees the same saves");

// 4. unsave on device 2 → gone on device 1 after a reload
await p2.goto(base + "/web", { waitUntil: "networkidle" });
await p2.locator('[data-guide="card"] button[aria-label="Remove from saves"]').first().click();
await wait(800);
await p1.reload({ waitUntil: "networkidle" });
await wait(800);
log((await savedSlugs(p1)).length === 1, `an unsave on one device reaches the other (${(await savedSlugs(p1)).length} left)`);

// 5. the navbar knows who you are; sign out goes back to an empty guest
await p1.goto(base + "/u/me", { waitUntil: "networkidle" });
log((await p1.getByText(EMAIL).count()) >= 1, "profile shows the signed-in email");
await p1.getByRole("button", { name: "Sign out" }).click();
await p1.waitForLoadState("networkidle");
await wait(800);
log((await p1.getByRole("link", { name: "Sign in" }).count()) >= 1, "signed out, the profile offers sign-in again");
log(
  (await savedSlugs(p1)).length === 0 && (await p1.evaluate(() => !Object.keys(localStorage).some((k) => k.startsWith("uiv.saves.u:")))),
  "signing out leaves no account data in the browser",
);

// 6. a used link doesn't work twice
const used = await linkFor(EMAIL);
const p3 = await (await ctx()).newPage();
await p3.goto(used, { waitUntil: "networkidle" });
log(new URL(p3.url()).pathname === "/sign-in" && (await p3.getByRole("alert").count()) >= 1, `a used link is refused (${new URL(p3.url()).pathname}${new URL(p3.url()).search})`);

// 7. Arabic sign-in, landing back in Arabic
const p4 = await (await ctx()).newPage();
await p4.goto(base + "/ar/sign-in", { waitUntil: "networkidle" });
log((await p4.getByRole("button", { name: "أرسل لي رابط الدخول" }).count()) === 1, "sign-in page is Arabic at /ar");
await p4.screenshot({ path: `${shots}/ar-sign-in.png` });
await signIn(p4, `layla+${Date.now()}@example.com`, "/ar/sign-in");
log(new URL(p4.url()).pathname === "/ar/saved", `Arabic sign-in lands on /ar/saved (${new URL(p4.url()).pathname})`);

// 8. signed out, saving still works locally
const p5 = await (await ctx()).newPage();
await p5.goto(base + "/web", { waitUntil: "networkidle" });
const before = await savedSlugs(p5);
await p5.locator('[data-guide="card"] button[aria-label="Save"]').first().click();
log((await savedSlugs(p5)).length === before.length + 1, "signed-out saving still works locally");

console.log(`\n${errors.length} page errors${errors.length ? ": " + [...new Set(errors)].join(" | ") : ""}`);
console.log(fails ? `${fails} FAILED` : "ALL PASSED");
await b.close();
process.exitCode = fails ? 1 : 0;
