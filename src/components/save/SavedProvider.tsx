"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/i18n/client";
import * as store from "./store";
import { saveOp, syncSaves } from "./actions";
import { guideEvent } from "../guide/events";

type Toast = { text: string; slug?: string } | null;

/** "all" and "unsorted" are views of the saves; anything else is a board id */
export type View = "all" | "unsorted" | (string & {});

type Ctx = {
  saves: store.Save[];
  boards: store.Collection[];
  ready: boolean;
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
  pin: (slug: string, boardId: string, pinned: boolean) => void;
  /** the boards a design is on */
  boardsOf: (slug: string) => string[];
  create: (name: string, description?: string) => string;
  update: (id: string, name: string, description: string) => void;
  remove: (id: string) => void;
  note: (slug: string, text: string) => void;
  noteOf: (slug: string) => string;
  /** a view's designs, newest first: saved order for all/unsorted, pinned order for a board */
  slugsIn: (view: View) => string[];
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
    let ready = false; // the guest merge comes first
    let sending = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const resync = () => syncSaves(null).then((s) => live && s && store.adopt(s));

    /*
     * Send the outbox one change at a time, oldest first — "new board" before "pin to it". A change leaves only when the server answers: one cut off by leaving the page is
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

  const toggle = useCallback((slug: string) => {
    if (!store.toggle(slug)) return setToast({ text: t.save.removed });
    setToast({ text: t.save.savedOne, slug });
    guideEvent("save");
  }, [t]);

  const value = useMemo<Ctx>(() => {
    const unsorted = (slug: string) => !state.pins.some((p) => p.slug === slug);
    return {
      saves: state.saves,
      boards: state.collections,
      ready: state.hydrated,
      isSaved: (slug) => state.saves.some((s) => s.slug === slug),
      toggle,
      pin: store.pin,
      boardsOf: (slug) => state.pins.filter((p) => p.slug === slug).map((p) => p.collectionId),
      create: store.create,
      update: store.update,
      remove: store.remove,
      note: store.note,
      noteOf: (slug) => state.saves.find((s) => s.slug === slug)?.note ?? "",
      slugsIn: (view) =>
        view === "all"
          ? state.saves.map((s) => s.slug)
          : view === "unsorted"
            ? state.saves.map((s) => s.slug).filter(unsorted)
            : state.pins.filter((p) => p.collectionId === view).map((p) => p.slug),
      toast,
      clearToast: () => setToast(null),
    };
  }, [state, toast, toggle]);

  return <SavedCtx.Provider value={value}>{children}</SavedCtx.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedCtx);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
