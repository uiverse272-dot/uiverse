// The site without an account: pages, headers, the guide's stored state, takedown errors in both
// languages, the language switch, share images and the MCP server. Run by e2e/run.mjs.
import { chromium } from "playwright";
const [base] = process.argv.slice(2);
let fails = 0;
const log = (ok, m) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"}  ${m}`); };
const csp = [];
const errors = [];
const b = await chromium.launch();
async function page(guide = '{"status":"off","step":0}') {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await c.addInitScript((s) => { try { localStorage.setItem("uiv.guide", s); } catch {} }, guide);
  c.on("console", (m) => /Content.Security.Policy|Refused to/i.test(m.text()) && csp.push(m.text().slice(0, 160)));
  const p = await c.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  return p;
}

/* every main page answers, and the ones that should 404 do */
for (const [path, want] of [["/", 200], ["/ar", 200], ["/web/fintech", 200], ["/apps", 200], ["/components/hero", 200], ["/explore", 200], ["/palettes", 200], ["/layouts", 200], ["/pricing", 200], ["/legal/privacy", 200], ["/ar/legal/takedown", 200], ["/search?q=fintech", 200], ["/web/bogus", 404], ["/creators", 404]]) {
  const r = await fetch(base + path);
  log(r.status === want, `${path} → ${r.status}`);
}
const head = (await fetch(base + "/")).headers;
log(!!head.get("content-security-policy") && head.get("x-frame-options") === "DENY" && !head.get("x-powered-by"), "security headers");

/* a stored guide state the code doesn't expect never blanks the page */
for (const s of ['{"done":true}', '{"status":"active","step":99}', "not json"]) {
  const p = await page(s);
  await p.goto(base + "/");
  await p.waitForTimeout(800);
  log((await p.evaluate(() => document.getElementsByTagName("*").length)) > 500, `guide state ${s} renders the page`);
  await p.context().close();
}

const p = await page();
for (const lang of ["", "/ar"]) {
  await p.goto(`${base}${lang}/legal/takedown`);
  await p.locator('input[name="domain"]').fill("not a domain");
  await p.locator("form button:not([type=button])").last().click();
  const text = await p.locator("#takedown-error").textContent({ timeout: 10000 });
  log(lang ? /[؀-ۿ]/.test(text) : /example\.com/.test(text), `takedown error in ${lang || "/en"}: ${text}`);
}

const sm = await (await fetch(`${base}/sitemap.xml`)).text();
const screen = sm.match(/\/screen\/(x-[^<]+)</)?.[1];
await p.goto(`${base}/screen/${screen}`);
log(/Captured \d{4}-\d\d-\d\d from the live site/.test(await p.locator("main").innerText()), "a capture shows its date");
await p.goto(`${base}/screen/s019-meridian-journal`);
log(/Sample design, not captured/.test(await p.locator("main").innerText()), "a sample says it's a sample");
await p.goto(`${base}/`);
log(!/\d[\d.,k]*\s+saves?\b/i.test(await p.locator("main").innerText()), "no invented save counts");
log((await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth > 0).length)) > 0, "screenshots load");

await p.goto(`${base}/web/fintech?sort=new`);
await p.locator('a[hreflang="ar"]').first().click();
await p.waitForURL(/\/ar\/web\/fintech\?sort=new/);
log(true, "language switch keeps the page and query");

/* the share image's address carries a build hash: take it from the page */
await p.goto(`${base}/screen/${screen}`);
const ogUrl = new URL((await p.locator('meta[property="og:image"]').getAttribute("content")) ?? "/", base);
const og = await fetch(base + ogUrl.pathname);
log(og.ok && (og.headers.get("content-type") ?? "").startsWith("image/"), "share image");
const rpc = await fetch(`${base}/api/mcp`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_screenshot", arguments: { slug: screen, max_height: 500 } } }),
});
log(/image\/jpeg/.test(await rpc.text()), "MCP screenshot");

log(!csp.length, `no CSP violations${csp.length ? ": " + csp.slice(0, 2).join(" | ") : ""}`);
log(!errors.length, `no page errors${errors.length ? ": " + [...new Set(errors)].join(" | ") : ""}`);
console.log(fails ? `${fails} FAILED` : "ALL PASSED");
await b.close();
process.exitCode = fails ? 1 : 0;
