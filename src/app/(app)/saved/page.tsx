"use client";

import Link from "next/link";
import { useState } from "react";
import { ITEMS } from "@/lib/data";
import { useSaved } from "@/components/save/SavedProvider";
import { Feed } from "@/components/feed/Feed";
import { PageHeader, Shell } from "@/components/feed/Section";
import { Plus } from "@/components/ui/icons";

export default function SavedPage() {
  const { saves, collections, ready, countFor, slugsFor, create } = useSaved();
  const [active, setActive] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const slugs = active === "all" ? saves.map((s) => s.slug) : slugsFor(active);
  const items = slugs.map((s) => ITEMS.find((i) => i.slug === s)).filter(Boolean) as typeof ITEMS;

  if (!ready) return null;

  return (
    <Shell>
      <PageHeader
        title="Saved"
        sub="Saving never asks which board. Organising is a separate, later act — that is why the toast offers “Move to…” instead of a dialog."
      />

      <div className="flex flex-wrap items-center gap-2 py-5">
        <button
          onClick={() => setActive("all")}
          className={`h-8 rounded-[999px] border px-3.5 text-[13px] font-medium ${
            active === "all" ? "border-text bg-text text-bg" : "border-border text-text-2 hover:text-text"
          }`}
        >
          All <span className="tabular-nums opacity-60">{saves.length}</span>
        </button>
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`h-8 rounded-[999px] border px-3.5 text-[13px] font-medium ${
              active === c.id ? "border-text bg-text text-bg" : "border-border text-text-2 hover:text-text"
            }`}
          >
            {c.name} <span className="tabular-nums opacity-60">{countFor(c.id)}</span>
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
            className="flex h-8 items-center gap-1.5 rounded-[999px] border border-border px-3"
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setCreating(false)}
              placeholder="Collection name"
              className="w-36 bg-transparent text-[13px] outline-none placeholder:text-text-3"
            />
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-[999px] border border-dashed border-border px-3 text-[13px] text-text-2 hover:text-text"
          >
            <Plus size={14} /> New collection
          </button>
        )}
      </div>

      {items.length ? (
        <Feed items={items} />
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-[15px] font-medium">Nothing saved here yet</p>
          <p className="max-w-sm text-[13.5px] text-text-2">
            Hover any card and hit Save — or press <kbd className="rounded border border-border px-1">S</kbd>.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-[8px] border border-border px-3.5 py-2 text-[13.5px] font-medium hover:bg-bg-subtle"
          >
            Browse the feed
          </Link>
        </div>
      )}
    </Shell>
  );
}
