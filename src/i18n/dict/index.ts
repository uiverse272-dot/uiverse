import type { Lang } from "../config";
import ar from "./ar";
import en, { type Dict } from "./en";

export type { Dict };
export const DICTS: Record<Lang, Dict> = { en, ar };
