"use server";

import { bySlug, type Item } from "@/lib/data";
import { LIMITS } from "@/lib/saves/db";

/** The saved designs themselves, for /saved — the browser keeps slugs, not the catalogue. */
export async function itemsBySlug(slugs: string[]): Promise<Item[]> {
  if (!Array.isArray(slugs)) return [];
  return slugs.slice(0, LIMITS.saves).flatMap((s) => {
    const item = typeof s === "string" ? bySlug(s) : undefined;
    return item ? [item] : [];
  });
}
