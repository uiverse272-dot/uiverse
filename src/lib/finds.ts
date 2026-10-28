import records from "@/content/finds.json";
import type { Lang } from "@/i18n/config";

/**
 * Finds: work by other designers, shown with their permission. Nothing here is collected from the
 * web — a creator submits their own piece (/finds/submit), the submission reaches the operator
 * the way takedown requests do (lib/takedown.ts), and an approved one is published with
 * `npm run finds:add`, which keeps a copy of the image the creator pointed us to. Each find
 * credits its creator and links out to the original.
 */

export const FIND_TAGS = [
  { slug: "interface", name: "Interface", ar: "واجهات" },
  { slug: "motion", name: "Motion", ar: "حركة" },
  { slug: "3d", name: "3D", ar: "ثلاثي الأبعاد" },
  { slug: "typography", name: "Typography", ar: "خطوط" },
  { slug: "branding", name: "Branding", ar: "هوية بصرية" },
  { slug: "illustration", name: "Illustration", ar: "رسم توضيحي" },
  { slug: "landing-page", name: "Landing page", ar: "صفحات هبوط" },
  { slug: "mobile", name: "Mobile app", ar: "تطبيقات الجوال" },
  { slug: "generative", name: "Generative", ar: "فن توليدي" },
] as const;
export type FindTag = (typeof FIND_TAGS)[number]["slug"];
export const isFindTag = (s: string): s is FindTag => FIND_TAGS.some((t) => t.slug === s);
export const tagName = (slug: string, lang: Lang) => {
  const t = FIND_TAGS.find((x) => x.slug === slug);
  return t ? (lang === "ar" ? t.ar : t.name) : slug;
};

export type Find = {
  slug: string;
  title: string;
  creator: string;
  /** the creator's own page (portfolio, Dribbble, X…) */
  creatorUrl: string;
  /** the piece itself, where it lives */
  url: string;
  /** our copy of the image the creator chose, under public/finds/ */
  image: { src: string; w: number; h: number };
  tags: FindTag[];
  addedAt: string;
};

/* newest first */
export const FINDS = ([...records] as Find[]).sort((a, b) => b.addedAt.localeCompare(a.addedAt));

export type Submission = {
  ref: string;
  title: string;
  creator: string;
  email: string;
  creatorUrl: string;
  url: string;
  imageUrl: string;
  tags: FindTag[];
  note: string;
  receivedAt: string;
};

/* the operator publishes from this one line, after looking at the work */
const addCommand = (s: Submission) =>
  [
    "npm run finds:add --",
    `--title ${JSON.stringify(s.title)}`,
    `--creator ${JSON.stringify(s.creator)}`,
    `--creator-url ${JSON.stringify(s.creatorUrl)}`,
    `--url ${JSON.stringify(s.url)}`,
    `--image ${JSON.stringify(s.imageUrl)}`,
    `--tags ${s.tags.join(",")}`,
  ].join(" ");

export function submissionText(s: Submission) {
  return [
    `Finds submission ${s.ref}`,
    `"${s.title}" by ${s.creator} <${s.email}>`,
    `Work: ${s.url}`,
    `Image: ${s.imageUrl}`,
    `Creator page: ${s.creatorUrl}`,
    `Tags: ${s.tags.join(", ") || "none"}`,
    s.note ? `Note: ${s.note}` : "",
    "They confirmed they made it and allow Uiverse to show the image, credited, with a link to the original.",
    `Publish it: ${addCommand(s)}`,
    `Received ${s.receivedAt}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
