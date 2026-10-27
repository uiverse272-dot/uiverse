"use client";

import { use, useState } from "react";
import { Link, useI18n, useLocalRouter } from "@/i18n/client";
import { fill, plural } from "@/i18n/format";
import { useSaved } from "@/components/save/SavedProvider";
import { useSavedItems } from "@/components/save/useSavedItems";
import { PinTools } from "@/components/save/PinTools";
import { Feed } from "@/components/feed/Feed";
import { Shell } from "@/components/feed/Section";
import { Chevron } from "@/components/ui/icons";

/**
 * One board, or one of the two views of the saves (/saved/all, /saved/unsorted). A board can be
 * renamed, described and deleted here; every card carries its note, and on a board, a way off it.
 */
export default function BoardPage({ params }: { params: Promise<{ board: string }> }) {
  const { board: raw } = use(params);
  const view = decodeURIComponent(raw);
  const { t, lang } = useI18n();
  const router = useLocalRouter();
  const { ready, boards, slugsIn, update, remove } = useSaved();
  const { known, loaded } = useSavedItems();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  /* the header draws as soon as the store has loaded; the designs follow when they arrive */
  if (!ready) return null;

  const board = boards.find((b) => b.id === view);
  const special = view === "all" || view === "unsorted";
  const back = (
    <Link href="/saved" className="inline-flex items-center gap-1 text-[12.5px] text-text-2 hover:text-text">
      <Chevron size={14} className="rotate-90 rtl:-rotate-90" /> {t.saved.back}
    </Link>
  );

  if (!board && !special) {
    return (
      <Shell>
        <div className="pt-7">{back}</div>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-[15px] font-medium">{t.saved.missingTitle}</h1>
          <p className="max-w-sm text-[13.5px] text-text-2">{t.saved.missingBody}</p>
        </div>
      </Shell>
    );
  }

  const slugs = slugsIn(view);
  const items = slugs.flatMap((s) => known.get(s) ?? []);
  const title = board ? board.name : view === "all" ? t.saved.all : t.saved.unsorted;
  const [emptyTitle, emptyBody] = board
    ? [t.saved.boardEmptyTitle, t.saved.boardEmptyBody]
    : view === "unsorted"
      ? [t.saved.unsortedEmptyTitle, t.saved.unsortedEmptyBody]
      : [t.saved.emptyTitle, t.saved.emptyBody];

  return (
    <Shell>
      <div className="pt-7">{back}</div>

      {board && editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            update(board.id, name, description);
            setEditing(false);
          }}
          className="mt-4 flex max-w-xl flex-col gap-2"
        >
          <input
            autoFocus
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            aria-label={t.saved.boardName}
            className="h-11 border border-border bg-surface px-3 text-[18px] font-bold outline-none focus:border-border-strong"
          />
          <textarea
            dir="auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
            rows={2}
            placeholder={t.saved.description}
            aria-label={t.saved.description}
            className="resize-none border border-border bg-surface px-3 py-2 text-[13.5px] outline-none placeholder:text-text-3 focus:border-border-strong"
          />
          <div className="flex gap-2">
            <button type="submit" className="h-9 bg-accent px-4 text-[13px] font-medium text-accent-fg">
              {t.saved.saveBoard}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="h-9 border border-border px-4 text-[13px] hover:bg-bg-subtle">
              {t.saved.cancel}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-4 pb-1 pt-3">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold leading-tight tracking-[-0.03em]">
              <bdi>{title}</bdi>
            </h1>
            {board?.description ? <p dir="auto" className="mt-1.5 max-w-2xl whitespace-pre-line text-[14px] text-text-2">{board.description}</p> : null}
            <p className="mt-1.5 text-[12.5px] text-text-3">{plural(t.saved.count, slugs.length, lang)}</p>
          </div>
          {board ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setName(board.name);
                  setDescription(board.description ?? "");
                  setConfirming(false);
                  setEditing(true);
                }}
                className="h-9 border border-border px-3.5 text-[13px] hover:bg-bg-subtle"
              >
                {t.saved.edit}
              </button>
              <button onClick={() => setConfirming(true)} className="h-9 border border-border px-3.5 text-[13px] hover:bg-bg-subtle">
                {t.saved.deleteBoard}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {board && confirming ? (
        <div role="alertdialog" aria-label={t.saved.deleteBoard} className="mt-4 flex flex-wrap items-center gap-3 border border-border bg-surface p-4">
          <p className="flex-1 text-[13.5px]">{fill(t.saved.confirmDelete, { name: board.name })}</p>
          <button
            autoFocus
            onClick={() => {
              remove(board.id);
              router.push("/saved");
            }}
            className="h-9 bg-accent px-4 text-[13px] font-medium text-accent-fg"
          >
            {t.saved.delete}
          </button>
          <button onClick={() => setConfirming(false)} className="h-9 border border-border px-4 text-[13px] hover:bg-bg-subtle">
            {t.saved.cancel}
          </button>
        </div>
      ) : null}

      <div className="py-6">
        {!loaded ? null : items.length ? (
          <Feed items={items} footer={(item) => <PinTools slug={item.slug} boardId={board?.id} />} />
        ) : (
          <div className="flex min-h-[36vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-[15px] font-medium">{emptyTitle}</p>
            <p className="max-w-sm text-[13.5px] text-text-2">{emptyBody}</p>
            <Link href="/" className="mt-2 border border-border px-3.5 py-2 text-[13.5px] font-medium hover:bg-bg-subtle">
              {t.saved.browse}
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}
