import type { MetadataRoute } from "next";
import { ITEMS } from "@/lib/data";
import { captureSrc } from "@/lib/captureSrc";
import { SITE_URL } from "@/lib/site";

/* the sections, then every real capture and its source. Procedural items are noindex (detail/load.ts) */
const SECTIONS = ["/", "/explore", "/web", "/apps", "/components", "/layouts", "/palettes", "/pricing"];
/* keys of DOCS in legal/[doc]/page.tsx — a page file can't export them */
const LEGAL = ["/legal/attribution", "/legal/takedown"];

const abs = (p: string) => (/^https?:\/\//.test(p) ? p : SITE_URL + p);

export default function sitemap(): MetadataRoute.Sitemap {
  const real = ITEMS.filter((i) => i.capture);
  const latest = new Map<string, string>();
  for (const i of real) {
    const prev = latest.get(i.source.slug);
    if (!prev || i.capture!.capturedAt > prev) latest.set(i.source.slug, i.capture!.capturedAt);
  }
  const newest = [...latest.values()].sort().at(-1);

  return [
    ...SECTIONS.map((p) => ({ url: abs(p), lastModified: newest, changeFrequency: "daily" as const, priority: p === "/" ? 1 : 0.8 })),
    ...LEGAL.map((p) => ({ url: abs(p), changeFrequency: "yearly" as const, priority: 0.2 })),
    ...real.map((i) => ({
      url: abs(`/${i.kind}/${i.slug}`),
      lastModified: i.capture!.capturedAt,
      changeFrequency: "monthly" as const,
      priority: i.kind === "screen" ? 0.7 : 0.5,
      images: i.kind === "screen" ? [abs(captureSrc(i.capture!.shots.desktop.src))] : undefined,
    })),
    ...[...latest].map(([slug, at]) => ({ url: abs(`/source/${slug}`), lastModified: at, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
