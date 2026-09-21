"use client";

import {
  createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode,
} from "react";
import * as store from "./store";

type Toast = { text: string; slug?: string } | null;

type Ctx = {
  saves: store.Save[];
  collections: store.Collection[];
  ready: boolean;
  isSaved: (slug: string) => boolean;
  toggle: (slug: string, collectionId?: string) => void;
  move: (slug: string, collectionId: string) => void;
  create: (name: string) => string;
  countFor: (id: string) => number;
  slugsFor: (id: string) => string[];
  toast: Toast;
  clearToast: () => void;
};

const SavedCtx = createContext<Ctx | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [toast, setToast] = useState<Toast>(null);

  const toggle = useCallback((slug: string, collectionId = "recent") => {
    const landedIn = store.toggle(slug, collectionId);
    setToast(landedIn ? { text: `Saved to ${landedIn}`, slug } : { text: "Removed" });
  }, []);

  const move = useCallback((slug: string, collectionId: string) => {
    store.move(slug, collectionId);
    setToast(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      saves: state.saves,
      collections: state.collections,
      ready: state.hydrated,
      isSaved: (slug) => state.saves.some((s) => s.slug === slug),
      toggle,
      move,
      create: store.create,
      countFor: (id) => state.saves.filter((s) => s.collectionId === id).length,
      slugsFor: (id) => state.saves.filter((s) => s.collectionId === id).map((s) => s.slug),
      toast,
      clearToast: () => setToast(null),
    }),
    [state, toast, toggle, move],
  );

  return <SavedCtx.Provider value={value}>{children}</SavedCtx.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedCtx);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
