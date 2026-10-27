"use client";

import { useEffect, useRef, useState } from "react";
import type { Item } from "@/lib/data";
import { itemsBySlug } from "./items";
import { useSaved } from "./SavedProvider";

/**
 * The saved designs themselves, fetched by slug as saves come in — the browser keeps slugs, not
 * the catalogue. A slug asked for once isn't asked again. `loaded` is false until the first
 * answer, so a page doesn't flash its empty state.
 */
export function useSavedItems() {
  const { saves, ready } = useSaved();
  const [known, setKnown] = useState<Map<string, Item>>(new Map());
  const asked = useRef(new Set<string>());
  const [fetched, setFetched] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const missing = saves.map((s) => s.slug).filter((s) => !asked.current.has(s));
    if (!missing.length) return setFetched(true);
    for (const s of missing) asked.current.add(s);
    /* not cancelled when saves change mid-request: those slugs are marked asked, so the answer must land */
    itemsBySlug(missing)
      .then((found) => setKnown((m) => new Map([...m, ...found.map((i) => [i.slug, i] as const)])))
      .catch(() => missing.forEach((s) => asked.current.delete(s)))
      .finally(() => setFetched(true));
  }, [ready, saves]);

  return { known, loaded: ready && (!saves.length || fetched) };
}
