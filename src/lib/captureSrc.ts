/**
 * Where capture screenshots are served from. Records keep a storage-agnostic path
 * ("/captures/<slug>/desktop.jpg"); with NEXT_PUBLIC_CAPTURES_URL set it resolves against
 * that bucket (objects keyed the same way, by `npm run capture:upload`), otherwise against
 * public/ as in local development.
 *
 * Its own module, not part of lib/captures.ts, so the client doesn't bundle the index.
 */
const BASE = (process.env.NEXT_PUBLIC_CAPTURES_URL ?? "").replace(/\/+$/, "");

export const captureSrc = (src: string) => BASE + src;
