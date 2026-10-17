import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { captureSrc } from "./captureSrc";
import { SITE_URL } from "./site";

/**
 * A capture screenshot's bytes, server-side: public/ when the file is on disk (local), otherwise
 * over HTTP — from the bucket when NEXT_PUBLIC_CAPTURES_URL is set, else from the site itself,
 * since a serverless function (Vercel) can't read public/ but the site serves it. Read by the
 * MCP server and the share images.
 */
export async function shotBytes(src: string): Promise<Buffer> {
  const file = path.join(process.cwd(), "public", src);
  if (existsSync(file)) return readFile(file);
  /* a bucket URL is absolute; a bare "/captures/…" resolves against the site's own address */
  const res = await fetch(new URL(captureSrc(src), SITE_URL));
  if (!res.ok) throw new Error(`Screenshot unavailable (${res.status}).`);
  return Buffer.from(await res.arrayBuffer());
}
