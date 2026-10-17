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
  /* the default collection's name is stored in English; show it in the page's language */
  const label = useCallback((c: store.Collection) => (c.id === "recent" ? t.save.recent : c.name), [t]);
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
    let ready = false; // the guest merge comes first
    let sending = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const resync = () => syncSaves(null).then((s) => live && s && store.adopt(s));

    /*
     * Send the outbox one change at a time, oldest first — "new collection" before "move into
     * it". A change leaves only when the server answers: one cut off by leaving the page is
     * still there next visit. If the server refuses one, its state wins afterwards.
     */
    const send = async () => {
      if (!ready || sending || !live) return;
      sending = true;
      let refused = false;
      try {
        for (let op = store.pending()[0]; op && live; op = store.pending()[0]) {
          const r = await saveOp(op).catch(() => null);
          if (!r) return; // offline or unloading — it stays queued
          if (!r.ok && r.error === "rate") {
            retry = setTimeout(send, 5000);
            return;
          }
          store.ack(op);
          if (!r.ok) refused = true;
        }
      } finally {
        sending = false;
      }
      if (refused) await resync();
    };

    store.signIn(userId, send);
    (async () => {
      const merged = await syncSaves(store.guestState());
      ready = true;
      if (!store.pending().length) {
        if (live && merged) store.adopt(merged);
        return;
      }
      /* an earlier visit left changes unsent: send them, then take the state that includes them */
      await send();
      if (live) await resync();
    })();
    return () => {
      live = false;
      clearTimeout(retry);
    };
  }, [userId]);

  const toggle = useCallback((slug: string, collectionId = "recent") => {
    if (!store.toggle(slug, collectionId)) return setToast({ text: t.save.removed });
    const where = store.getSnapshot().collections.find((c) => c.id === collectionId);
    setToast({ text: fill(t.save.savedTo, { name: where ? label(where) : t.save.recent }), slug });
    guideEvent("save");
  }, [t, label]);

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

/**
 * An item's save count with your own save in it. It subscribes to that one item's answer, so a
 * save re-renders only the cards whose count changed — not everything that reads the context.
 */
export function useSaveCount(item: { slug: string; saves: number }) {
  const mine = useSyncExternalStore(store.subscribe, () => store.isSaved(item.slug), () => false);
  return item.saves + (mine ? 1 : 0);
}

export function useSaved() {
  const ctx = useContext(SavedCtx);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
