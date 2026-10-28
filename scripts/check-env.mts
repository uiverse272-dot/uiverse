/**
 * Is this environment ready for production? Checks names, never prints values.
 *
 *   npm run check:env                      .env.local
 *   npm run check:env -- .env.production   e.g. after `vercel env pull .env.production`
 *
 * Exits 1 when a required setting is missing.
 */
import { existsSync } from "node:fs";
import { checkConfig, missing } from "../src/lib/config";

const file = process.argv[2] ?? ".env.local";
if (existsSync(file)) process.loadEnvFile(file);
else if (process.argv[2]) {
  console.error(`no such file: ${file}`);
  process.exit(2);
}

const checks = checkConfig();
console.log(`\nProduction settings in ${existsSync(file) ? file : "the environment"}:\n`);
for (const c of checks) {
  const mark = c.ok ? "✓" : c.level === "required" ? "✗" : "·";
  console.log(`  ${mark} ${c.label}${c.ok ? "" : `\n      ${c.fix}`}`);
}
const gaps = missing(checks);
console.log(gaps.length ? `\n${gaps.length} required setting(s) missing.\n` : "\nEverything required is set.\n");
process.exit(gaps.length ? 1 : 0);
