#!/usr/bin/env node
/**
 * The browser suites, against a production build: `npm run build && npm run e2e`.
 *
 * Starts `next start` on its own port with the embedded database and sign-in links written to the
 * log (UIV_LOCAL_DB, AUTH_LOG_LINKS — test-only switches), runs each suite, and stops it. The
 * account suites sign in several times, and Better Auth limits sign-in requests per minute, so
 * they're spaced a minute apart.
 */
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";
import path from "node:path";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const base = `http://localhost:${PORT}`;
const dir = path.join("e2e", ".out");
mkdirSync(dir, { recursive: true });
const serverLog = path.join(dir, "server.log");
const only = process.argv.slice(2);

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  env: {
    ...process.env,
    UIV_LOCAL_DB: "1",
    AUTH_LOG_LINKS: "1",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "e2e-only-secret-not-for-production-0123456789",
    BETTER_AUTH_URL: base,
  },
  stdio: ["ignore", "pipe", "pipe"],
});
const out = createWriteStream(serverLog);
server.stdout.pipe(out);
server.stderr.pipe(out);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let up = false;
for (let i = 0; i < 60 && !up; i++) {
  up = await fetch(base).then((r) => r.ok, () => false);
  if (!up) await wait(1000);
}
if (!up) {
  console.error(`the server didn't start — see ${serverLog}`);
  server.kill();
  process.exit(1);
}

const SUITES = [
  ["smoke", false],
  ["accounts", true],
  ["outbox", true],
  ["delete", true],
].filter(([name]) => !only.length || only.includes(name));

const failed = [];
let signedInBefore = false;
for (const [name, signsIn] of SUITES) {
  if (signsIn && signedInBefore) await wait(65_000);
  console.log(`\n— ${name}`);
  /* not spawnSync: this process copies the server's output into the log the suites read links from */
  const suite = spawn("node", [path.join("e2e", `${name}.mjs`), base, serverLog, path.join(dir, "shots")], { stdio: "inherit" });
  const code = await new Promise((r) => suite.on("exit", r));
  if (code !== 0) failed.push(name);
  signedInBefore ||= signsIn;
}
server.kill();
console.log(failed.length ? `\nfailed: ${failed.join(", ")}` : "\nall suites passed");
process.exit(failed.length ? 1 : 0);
