"use client";

import { useEffect, useId, useState } from "react";
import { useI18n, useLocalRouter } from "@/i18n/client";
import { guessDevice, lookFromPixels, lookQuery } from "@/lib/look";
import { Upload } from "../ui/icons";

/* plenty for a palette, and a full-page capture stays a few hundred thousand pixels */
const SAMPLE_W = 120;
const MAX_H = 1200;

/** The look of an image file, read on a canvas — the image itself never leaves the browser. */
async function readLook(file: File) {
  const bitmap = await createImageBitmap(file);
  const w = SAMPLE_W;
  const h = Math.max(1, Math.min(MAX_H, Math.round((SAMPLE_W * bitmap.height) / bitmap.width)));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const look = lookFromPixels(ctx.getImageData(0, 0, w, h).data, w, h);
  const device = guessDevice(bitmap.width, bitmap.height);
  bitmap.close();
  return { ...look, device };
}

/** Drop, paste or pick a screenshot; the result page (`to`) gets its colours in the URL. */
export function ImageDrop({ compact = false, to = "/similar" }: { compact?: boolean; to?: string }) {
  const { t } = useI18n();
  const s = t.similar;
  const router = useLocalRouter();
  const inputId = useId();
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const take = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      setFailed(!!file);
      return;
    }
    setBusy(true);
    setFailed(false);
    try {
      const look = await readLook(file);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(file);
      });
      router.push(`${to}?${lookQuery(look)}`, { scroll: false });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  /* a screenshot is usually on the clipboard already */
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) take(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files[0]);
      }}
      className={`flex flex-wrap items-center gap-4 border border-dashed p-4 transition-colors ${
        over ? "border-border-strong bg-bg-subtle" : "border-border bg-surface"
      } ${compact ? "" : "min-h-36 justify-center"}`}
    >
      {preview ? (
        // a blob: URL of the viewer's own file — next/image can't optimise it and needn't
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-20 w-20 shrink-0 border border-border object-cover object-top" />
      ) : (
        <Upload size={22} className="shrink-0 text-text-3" />
      )}
      <div className="min-w-40 flex-1">
        <p className="text-[13.5px] font-medium">{busy ? s.reading : s.drop}</p>
        <p className="text-[12px] text-text-3">{failed ? s.failed : s.formats}</p>
      </div>
      <label
        htmlFor={inputId}
        className="ms-auto shrink-0 cursor-pointer border border-border bg-bg px-3 py-1.5 text-[12.5px] font-medium hover:bg-bg-subtle"
      >
        {preview ? s.another : s.choose}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
