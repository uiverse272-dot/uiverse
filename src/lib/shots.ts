import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { captureSrc } from "./captureSrc";

/**
 * A capture screenshot's bytes, server-side: public/ in local development, the bucket once
 * deployed, where public/captures isn't shipped. Read by the MCP server and the share images.
 */
export async function shotBytes(src: string): Promise<Buffer> {
  const file = path.join(process.cwd(), "public", src);
  if (existsSync(file)) return readFile(file);
  const res = await fetch(captureSrc(src));
  if (!res.ok) throw new Error(`Screenshot unavailable (${res.status}).`);
  return Buffer.from(await res.arrayBuffer());
}
