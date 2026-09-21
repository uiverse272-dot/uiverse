import type { Item } from "./data";
import { colorRoles, layoutSpec, responsiveRules, sections, SPACING, typeScale } from "./spec";
import { name, CATEGORIES, INDUSTRIES, STYLES } from "./taxonomy";

/**
 * Implementation prompt generator.
 *
 * The output is a structured specification, not a description of a picture.
 * That is only possible because the capture was decomposed first — a competitor
 * without the Breakdown can only hand a model an image and hope.
 */

export type ToolId = "claude" | "chatgpt" | "cursor" | "codex" | "v0" | "lovable" | "bolt";
export type StackId = "nextjs" | "react" | "html" | "vue" | "swiftui";

export const TOOLS: { id: ToolId; name: string; hint: string }[] = [
  { id: "claude", name: "Claude", hint: "Full spec, asks for one complete runnable file" },
  { id: "chatgpt", name: "ChatGPT", hint: "Full spec, explicit about no placeholder comments" },
  { id: "cursor", name: "Cursor", hint: "Terse, file-oriented, assumes an existing codebase" },
  { id: "codex", name: "Codex", hint: "Terse, task-shaped, no preamble" },
  { id: "v0", name: "v0", hint: "Single page component, Next.js + Tailwind assumed" },
  { id: "lovable", name: "Lovable", hint: "Screen-level, reuses an existing design system" },
  { id: "bolt", name: "Bolt", hint: "Scaffolds a new project from scratch" },
];

export const STACKS: { id: StackId; name: string; tokens: "tailwind" | "css" | "swift" }[] = [
  { id: "nextjs", name: "Next.js + Tailwind", tokens: "tailwind" },
  { id: "react", name: "React + Tailwind", tokens: "tailwind" },
  { id: "html", name: "HTML + CSS", tokens: "css" },
  { id: "vue", name: "Vue + Tailwind", tokens: "tailwind" },
  { id: "swiftui", name: "SwiftUI", tokens: "swift" },
];

export type PromptOptions = {
  tool: ToolId;
  stack: StackId;
  includeTokens: boolean;
  includeType: boolean;
  includeLayout: boolean;
  includeSections: boolean;
  includeA11y: boolean;
};

export const DEFAULT_OPTIONS: PromptOptions = {
  tool: "claude",
  stack: "nextjs",
  includeTokens: true,
  includeType: true,
  includeLayout: true,
  includeSections: true,
  includeA11y: true,
};

/* ------------------------------------------------------------------ */

function preamble(tool: ToolId, subject: string, stackName: string) {
  switch (tool) {
    case "cursor":
      return `Add ${subject} to this codebase, built with ${stackName}.\n\nFollow the conventions already in the repo: existing component structure, existing token names, existing utility helpers. Do not add dependencies. Do not restate the spec back to me — make the edits.`;
    case "codex":
      return `Task: implement ${subject} in ${stackName}.\n\nWrite the files. No preamble, no explanation, no TODO comments.`;
    case "v0":
      return `Build ${subject} as a single page component using ${stackName}.\n\nUse shadcn/ui primitives where one fits; write plain elements where one does not. One file, production quality, no placeholder content.`;
    case "lovable":
      return `Build ${subject} using ${stackName}.\n\nIf the project already has a design system, use its tokens and components rather than the raw values below — treat this spec as the intent, not the implementation.`;
    case "bolt":
      return `Create a new ${stackName} project containing ${subject}.\n\nSet up the tokens below as the theme before writing any markup, so every value comes from the theme rather than being hard-coded.`;
    case "chatgpt":
      return `Build ${subject} using ${stackName}.\n\nReturn one complete, runnable file. No placeholder comments, no "// rest of the code here", no lorem ipsum — write plausible real copy.`;
    default:
      return `Build ${subject} using ${stackName}.\n\nReturn one complete, runnable file. Every value below is measured from a real interface, so treat it as a specification rather than a suggestion. Where the spec is silent, choose the restrained option.`;
  }
}

function tokenBlock(item: Item, syntax: "tailwind" | "css" | "swift") {
  const roles = colorRoles(item);
  if (syntax === "swift") {
    return [
      "```swift",
      "extension Color {",
      ...roles.map(
        (r) => `    static let ${camel(r.token)} = Color(hex: "${r.value}")`,
      ),
      "}",
      "```",
    ].join("\n");
  }
  if (syntax === "css") {
    return ["```css", ":root {", ...roles.map((r) => `  --${r.token}: ${r.value};`), "}", "```"].join("\n");
  }
  return [
    "```css",
    "@theme {",
    ...roles.map((r) => `  --color-${r.token}: ${r.value};`),
    "}",
    "```",
    "",
    "Reference them as `bg-background`, `text-text-muted`, `border-border` and so on. Do not hard-code hex values in markup.",
  ].join("\n");
}

const camel = (s: string) => s.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());

export function buildPrompt(item: Item, opts: PromptOptions): string {
  const stack = STACKS.find((s) => s.id === opts.stack)!;
  const isComponent = item.kind === "component";
  const category = lower(name(CATEGORIES, item.category));
  const industry = lower(name(INDUSTRIES, item.industry));
  const style = lower(name(STYLES, item.style));
  const layout = layoutSpec(item);

  /* "landing page screen" reads as a tautology; "dashboard screen" does not */
  const noun = /\bpage$/.test(category) ? category : `${category} screen`;
  const subject = isComponent
    ? `a ${item.title.toLowerCase()} component for a ${industry} product`
    : `a ${noun} for a ${industry} product`;

  const out: string[] = [];

  out.push(preamble(opts.tool, subject, stack.name));
  out.push("");
  out.push(
    `The register is **${style}** — ${styleNote(style)} The target is ${
      item.device === "mobile" ? "a phone screen at 390pt" : "desktop at 1440px, then tablet and mobile"
    }.`,
  );

  if (opts.includeSections) {
    out.push("", "## Structure", "", "Render these in order. The note after each is how it actually looks.", "");
    for (const s of sections(item)) {
      out.push(`${s.index}. **${s.label}** — ${s.note}`);
    }
  }

  if (opts.includeTokens) {
    out.push("", "## Colour tokens", "", tokenBlock(item, stack.tokens));
    out.push(
      "",
      "Accent is used sparingly: primary buttons, the active navigation state, and at most one emphasis elsewhere. Everything else is neutral.",
    );
  }

  if (opts.includeType) {
    const scale = typeScale(item);
    out.push("", "## Typography", "", "| Step | Size | Weight | Used for |", "| --- | --- | --- | --- |");
    for (const t of scale) out.push(`| ${t.name} | ${t.size}px | ${t.weight} | ${t.use} |`);
    out.push(
      "",
      `One sans-serif family throughout. Tracking tightens to about -0.028em above 40px and sits near -0.011em below it. Body line height ${layout.body.split(" / ")[1]}.`,
    );
  }

  if (opts.includeLayout) {
    out.push(
      "",
      "## Layout and spacing",
      "",
      `- Container: ${layout.container}, ${layout.columns}, ${layout.gutter} gutters`,
      `- Radius: ${layout.radius} — nothing is fully rounded except pills and avatars`,
      `- Spacing scale (4px base): ${SPACING.join(", ")}`,
      "- Hairline borders at 1px, low contrast. Shadows only on popovers and overlays, never on cards at rest.",
    );
    out.push("", "## Responsive behaviour", "");
    for (const [k, v] of responsiveRules(item)) out.push(`- **${k}:** ${v}`);
  }

  if (opts.includeA11y) {
    out.push(
      "",
      "## Requirements",
      "",
      "- Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`",
      "- Every interactive element keyboard reachable with a visible focus ring",
      "- Colour contrast at least 4.5:1 for body text against its background",
      "- Honour `prefers-reduced-motion`; transitions no longer than 150ms",
      "- Explicit width and height on every image so nothing shifts as it loads",
      "- Write plausible product copy — never lorem ipsum, never placeholder brackets",
    );
  }

  out.push(
    "",
    "## Out of scope",
    "",
    "- Do not reproduce any real company's name, logo, wordmark or copy. This is a structural and stylistic reference, not a brand to clone.",
    "- No analytics, auth or data fetching unless asked — markup, styling and layout only.",
  );

  return out.join("\n");
}

/** Lowercase a taxonomy label unless it carries internal capitals (SaaS, AI). */
const lower = (s: string) => (/[A-Z]/.test(s.slice(1)) ? s : s.toLowerCase());

function styleNote(style: string) {
  const notes: Record<string, string> = {
    dark: "deep neutral backgrounds, one luminous accent, generous negative space.",
    minimal: "near-monochrome, hairlines instead of shadows, hierarchy carried by type alone.",
    light: "bright neutral ground with a single saturated accent.",
    editorial: "large type, wide measure, restrained colour, content-first.",
    brutalist: "flat blocks, hard edges, high contrast, little ornament.",
    luxury: "warm dark ground, metallic accent, slow rhythm, lots of air.",
    corporate: "structured, blue-leaning, predictable grid, conservative type.",
    playful: "saturated accents, rounder radii, energetic spacing.",
    futuristic: "dark ground, neon accent, glow used once rather than everywhere.",
    glassmorphism: "translucent surfaces over a soft gradient, thin light borders.",
    retro: "warm muted palette, heavier type, visible grid.",
  };
  return notes[style] ?? "restrained and content-led.";
}

/** Rough token estimate for the usage line in the dialog. */
export const estimateTokens = (text: string) => Math.ceil(text.length / 4);
