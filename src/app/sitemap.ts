import type { MetadataRoute } from "next";
import { localize } from "@/i18n/config";
import { ITEMS } from "@/lib/data";
import { captureSrc } from "@/lib/captureSrc";
import { SITE_URL } from "@/lib/site";

/* the sections, then every real capture and its source. Procedural items are noindex (detail/load.ts) */
const SECTIONS = ["/", "/explore", "/web", "/apps", "/components", "/layouts", "/palettes", "/pricing"];
/* the documents in dict legal.* */
const LEGAL = ["/legal/attribution", "/legal/takedown", "/legal/privacy"];

const abs = (p: string) => (/^https?:\/\//.test(p) ? p : SITE_URL + p);

type Entry = Omit<MetadataRoute.Sitemap[number], "url">;

/** One page in both languages, each listing the other as its alternate (hreflang). */
const both = (path: string, entry: Entry): MetadataRoute.Sitemap => {
  const languages = { en: abs(path), ar: abs(localize("ar", path)) };
  return [
    { url: languages.en, ...entry, alternates: { languages } },
    { url: languages.ar, ...entry, alternates: { languages } },
  ];
};

export default function sitemap(): MetadataRoute.Sitemap {
  const real = ITEMS.filter((i) => i.capture);
  const latest = new Map<string, string>();
  for (const i of real) {
    const prev = latest.get(i.source.slug);
    if (!prev || i.capture!.capturedAt > prev) latest.set(i.source.slug, i.capture!.capturedAt);
  }
  const newest = [...latest.values()].sort().at(-1);

  return [
    ...SECTIONS.flatMap((p) => both(p, { lastModified: newest, changeFrequency: "daily", priority: p === "/" ? 1 : 0.8 })),
    ...LEGAL.flatMap((p) => both(p, { changeFrequency: "yearly", priority: 0.2 })),
    ...real.flatMap((i) =>
      both(`/${i.kind}/${i.slug}`, {
        lastModified: i.capture!.capturedAt,
        changeFrequency: "monthly",
        priority: i.kind === "screen" ? 0.7 : 0.5,
        images: i.kind === "screen" ? [abs(captureSrc(i.capture!.shots.desktop.src))] : undefined,
      }),
    ),
    ...[...latest].flatMap(([slug, at]) => both(`/source/${slug}`, { lastModified: at, changeFrequency: "monthly", priority: 0.6 })),
  ];
}
