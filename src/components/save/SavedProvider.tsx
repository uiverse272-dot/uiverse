"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import * as store from "./store";
import { saveOp, syncSaves } from "./actions";
import { guideEvent } from "../guide/events";

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
  const { t } = useI18n();
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [toast, setToast] = useState<Toast>(null);
  /*
   * Signed in: the account is the source of truth. Merge what this browser saved as a guest,
   * then send each change as it happens; if the server refuses one, take its state back.
   */
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const signedOut = !session.isPending && !userId;
  useEffect(() => {
    if (signedOut) store.signOut();
  }, [signedOut]);
  useEffect(() => {
    if (!userId) return;
    let live = true;
    const resync = () => syncSaves(null).then((s) => live && s && store.adopt(s));
    store.signIn(userId, (op) => {
      saveOp(op).then((r) => (r.ok ? undefined : resync()), resync);
    });
    syncSaves(store.guestState()).then((s) => live && s && store.adopt(s));
    return () => {
      live = false;
    };
  }, [userId]);

  /* the default collection's name is stored in English; show it in the page's language */
  const label = useCallback((c: store.Collection) => (c.id === "recent" ? t.save.recent : c.name), [t]);

  const toggle = useCallback((slug: string, collectionId = "recent") => {
    const landedIn = store.toggle(slug, collectionId);
    const where = collectionId === "recent" ? t.save.recent : landedIn;
    setToast(landedIn ? { text: fill(t.save.savedTo, { name: where ?? "" }), slug } : { text: t.save.removed });
    if (landedIn) guideEvent("save");
  }, [t]);

  const move = useCallback((slug: string, collectionId: string) => {
    store.move(slug, collectionId);
    setToast(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      saves: state.saves,
      collections: state.collections.map((c) => ({ ...c, name: label(c) })),
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
    [state, toast, toggle, move, label],
  );

  return <SavedCtx.Provider value={value}>{children}</SavedCtx.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedCtx);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
