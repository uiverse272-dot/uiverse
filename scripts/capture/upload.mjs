#!/usr/bin/env node
/**
 * Sync capture screenshots to an S3-compatible bucket (Cloudflare R2, S3, B2, MinIO).
 *
 *   npm run capture:upload                 upload new and changed screenshots
 *   npm run capture:upload -- --dry-run    show what would change, touch nothing
 *   npm run capture:upload -- --prune      also delete objects whose capture is gone
 *
 * Objects are keyed like the paths in captures.json (captures/<slug>/<viewport>.jpg), so the app
 * finds them once NEXT_PUBLIC_CAPTURES_URL is the bucket's public URL (lib/captureSrc.ts).
 * Unchanged files are skipped by comparing their MD5 with the object's ETag.
 *
 * Reads .env.local: S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION (optional).
 */
import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC = path.join(ROOT, "public");
const PREFIX = "captures/";
const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
/* a recapture overwrites the same key, so a day rather than immutable */
const CACHE = "public, max-age=86400";

const flags = new Set(process.argv.slice(2));
const dry = flags.has("--dry-run");

const env = ["S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
const missing = env.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`missing ${missing.join(", ")} — set them in .env.local (see .env.example)`);
  process.exit(1);
}
const Bucket = process.env.S3_BUCKET;
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? "auto",
  /* host/bucket/key — the one addressing style R2, S3, B2 and MinIO all accept */
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY },
});

async function remote() {
  const etags = new Map();
  let ContinuationToken;
  do {
    const page = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: PREFIX, ContinuationToken }));
    for (const o of page.Contents ?? []) etags.set(o.Key, o.ETag?.replaceAll('"', ""));
    ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return etags;
}

async function local() {
  const entries = await readdir(path.join(PUBLIC, PREFIX), { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && TYPES[path.extname(e.name).toLowerCase()])
    .map((e) => path.relative(PUBLIC, path.join(e.parentPath, e.name)).split(path.sep).join("/"));
}

/* a few uploads at a time — enough to saturate a home connection without tripping rate limits */
async function pool(list, n, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < list.length) await fn(list[next++]);
  }));
}

async function main() {
  const [have, keys] = await Promise.all([remote(), local()]);
  let uploaded = 0, unchanged = 0, bytes = 0;

  await pool(keys, 6, async (Key) => {
    const body = await readFile(path.join(PUBLIC, Key));
    if (have.get(Key) === createHash("md5").update(body).digest("hex")) return void unchanged++;
    uploaded++;
    bytes += body.length;
    console.log(`${dry ? "would upload" : "↑"} ${Key} (${Math.round(body.length / 1024)} KB)`);
    if (dry) return;
    await s3.send(new PutObjectCommand({
      Bucket, Key, Body: body,
      ContentType: TYPES[path.extname(Key).toLowerCase()],
      CacheControl: CACHE,
    }));
  });

  /* in the bucket with no local file */
  const onDisk = new Set(keys);
  const orphans = [...have.keys()].filter((k) => !onDisk.has(k));
  const stale = flags.has("--prune") ? orphans : [];
  for (const k of stale) console.log(`${dry ? "would delete" : "✗"} ${k}`);
  /* DeleteObjects takes at most 1000 keys */
  for (let i = 0; !dry && i < stale.length; i += 1000) {
    await s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: stale.slice(i, i + 1000).map((Key) => ({ Key })) } }));
  }

  const mb = (bytes / 1048576).toFixed(1);
  const [up, del] = dry ? ["would upload", "would delete"] : ["uploaded", "deleted"];
  console.log(`\n${uploaded} ${up} (${mb} MB), ${unchanged} unchanged${stale.length ? `, ${stale.length} ${del}` : ""}`);
  const notPruned = orphans.length - stale.length;
  if (notPruned) console.log(`${notPruned} object(s) in the bucket have no local file — --prune removes them`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
