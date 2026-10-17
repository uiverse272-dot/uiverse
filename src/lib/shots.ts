import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { captureSrc } from "./captureSrc";
import type { Crop, Shot } from "./captures";
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

/**
 * A band of a screenshot as a JPEG: from the crop's top (or the page's), at most `maxH` CSS pixels
 * tall, resized to `width`. `h` is the band's height in CSS pixels; `cut` when it stopped short.
 */
export async function cropShot(shot: Shot, crop: Crop | undefined, opts: { maxH: number; width: number; quality: number }) {
  const top = crop ? crop.y * shot.docH : 0;
  const full = crop ? crop.h * shot.docH : shot.cssH;
  const h = Math.min(full, opts.maxH, shot.cssH - top);
  const scale = shot.w / shot.css; // device pixels per CSS pixel
  const jpeg = await sharp(await shotBytes(shot.src))
    .extract({ left: 0, top: Math.round(top * scale), width: shot.w, height: Math.max(1, Math.round(h * scale)) })
    .resize({ width: opts.width, withoutEnlargement: true })
    .jpeg({ quality: opts.quality })
    .toBuffer();
  return { jpeg, h, cut: h < full };
}
