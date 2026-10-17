"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useI18n } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";
import type { Item } from "@/lib/data";
import { itemsBySlug } from "@/components/save/items";
import { useSaved } from "@/components/save/SavedProvider";
import { Feed } from "@/components/feed/Feed";
import { PageHeader, Shell } from "@/components/feed/Section";
import { Plus } from "@/components/ui/icons";

export default function SavedPage() {
  const { t } = useI18n();
  const { saves, collections, ready, countFor, slugsFor, create } = useSaved();
  const signedIn = !!authClient.useSession().data;
  const [active, setActive] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  /* the designs are fetched by slug as saves come in; a slug asked for once isn't asked again */
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

  const slugs = active === "all" ? saves.map((s) => s.slug) : slugsFor(active);
  const items = slugs.flatMap((s) => known.get(s) ?? []);

  if (!ready || (saves.length && !fetched)) return null;

  return (
    <Shell>
      <PageHeader
        title={t.saved.title}
        sub={t.saved.sub}
      />
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

      <div className="flex flex-wrap items-center gap-2 py-5">
        <button
          onClick={() => setActive("all")}
          className={`h-8 border px-3.5 text-[13px] font-medium ${
            active === "all" ? "border-border bg-accent text-accent-fg" : "border-border text-text-2 hover:text-text"
          }`}
        >
          {t.saved.all} <span className="tabular-nums opacity-60">{saves.length}</span>
        </button>
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`h-8 border px-3.5 text-[13px] font-medium ${
              active === c.id ? "border-border bg-accent text-accent-fg" : "border-border text-text-2 hover:text-text"
            }`}
          >
            <bdi>{c.name}</bdi> <span className="tabular-nums opacity-60">{countFor(c.id)}</span>
          </button>
        ))}
        {creating ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) create(name.trim());
              setName("");
              setCreating(false);
            }}
            className="flex h-8 items-center gap-1.5 border border-border px-3"
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setCreating(false)}
              placeholder={t.saved.collectionName}
              className="w-36 bg-transparent text-[13px] outline-none placeholder:text-text-3"
            />
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex h-8 items-center gap-1.5 border border-dashed border-border px-3 text-[13px] text-text-2 hover:text-text"
          >
            <Plus size={14} /> {t.saved.newCollection}
          </button>
        )}
      </div>

      {items.length ? (
        <Feed items={items} />
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-[15px] font-medium">{t.saved.emptyTitle}</p>
          <p className="max-w-sm text-[13.5px] text-text-2">{t.saved.emptyBody}</p>
          <Link
            href="/"
            className="mt-2 border border-border px-3.5 py-2 text-[13.5px] font-medium hover:bg-bg-subtle"
          >
            {t.saved.browse}
          </Link>
        </div>
      )}
    </Shell>
  );
}
