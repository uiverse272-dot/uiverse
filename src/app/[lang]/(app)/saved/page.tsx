"use client";

import { useState } from "react";
import { Link, useI18n } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";
import { useSaved, type View } from "@/components/save/SavedProvider";
import { useSavedItems } from "@/components/save/useSavedItems";
import { BoardTile } from "@/components/save/BoardTile";
import { PageHeader, Shell } from "@/components/feed/Section";
import { Plus } from "@/components/ui/icons";

/** Saved: every board as a tile, with All saves and Unsorted first. Each opens at /saved/[board]. */
export default function SavedPage() {
  const { t } = useI18n();
  const { saves, boards, slugsIn, create } = useSaved();
  const { known, loaded } = useSavedItems();
  const signedIn = !!authClient.useSession().data;
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!loaded) return null;

  const tile = (view: View, label: string) => {
    const slugs = slugsIn(view);
    return (
      <BoardTile
        key={view}
        href={`/saved/${view}`}
        name={label}
        count={slugs.length}
        items={slugs.slice(0, 3).flatMap((s) => known.get(s) ?? [])}
      />
    );
  };

  return (
    <Shell>
      <PageHeader title={t.saved.title} sub={t.saved.sub} />
      <p className="mt-4 text-[12.5px] text-text-3">
        {signedIn ? (
          t.auth.synced
        ) : (
          <>
            {t.auth.keepSaves}{" "}
            <Link href="/sign-in?next=/saved" className="underline underline-offset-2">
              {t.auth.signIn}
            </Link>
          </>
        )}
      </p>

      {saves.length || boards.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 py-7 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {tile("all", t.saved.all)}
          {tile("unsorted", t.saved.unsorted)}
          {boards.map((b) => tile(b.id, b.name))}

          {creating ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                create(name.trim(), description.trim());
                setName("");
                setDescription("");
                setCreating(false);
              }}
              className="flex flex-col gap-2 border border-border bg-surface p-3"
            >
              <input
                autoFocus
                dir="auto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder={t.saved.boardName}
                aria-label={t.saved.boardName}
                className="h-9 border border-border bg-bg px-2.5 text-[13px] outline-none placeholder:text-text-3 focus:border-border-strong"
              />
              <textarea
                dir="auto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={280}
                rows={2}
                placeholder={t.saved.description}
                aria-label={t.saved.description}
                className="resize-none border border-border bg-bg px-2.5 py-2 text-[13px] outline-none placeholder:text-text-3 focus:border-border-strong"
              />
              <div className="mt-auto flex gap-2">
                <button type="submit" className="h-9 flex-1 bg-accent text-[13px] font-medium text-accent-fg">
                  {t.saved.create}
                </button>
                <button type="button" onClick={() => setCreating(false)} className="h-9 border border-border px-3 text-[13px] hover:bg-bg-subtle">
                  {t.saved.cancel}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex min-h-40 flex-col items-center justify-center gap-2 border border-dashed border-border text-[13.5px] text-text-2 hover:text-text"
            >
              <Plus size={20} /> {t.saved.newBoard}
            </button>
          )}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-[15px] font-medium">{t.saved.emptyTitle}</p>
          <p className="max-w-sm text-[13.5px] text-text-2">{t.saved.emptyBody}</p>
          <Link href="/" className="mt-2 border border-border px-3.5 py-2 text-[13.5px] font-medium hover:bg-bg-subtle">
            {t.saved.browse}
          </Link>
        </div>
      )}
    </Shell>
  );
}
