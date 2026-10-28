import type { Palette } from "@/lib/palettes";
import type { Item } from "@/lib/data";
import type { U, Viewport } from "../primitives";

/**
 * Every section takes the viewport it is drawn at. The desktop values are the
 * original design; tablet and mobile follow the rules documented in
 * `responsiveRules` (src/lib/spec.ts) — keep the two in step.
 */
export type SecProps = { u: U; p: Palette; item: Item; vp: Viewport };
