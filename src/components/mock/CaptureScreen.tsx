"use client";

import Image from "next/image";
import type { Item } from "@/lib/data";
import type { Viewport } from "@/lib/captures";
import { captureSrc } from "@/lib/captureSrc";
import { cardOf } from "@/lib/cards";

/**
 * A real capture, drawn from its screenshot. Same contract as MockScreen: without
 * `viewport` it fills a frame of `item.aspect` (feed cards), with one it shows that
 * width's capture at its natural height (detail frame, responsive tab).
 *
 * Geometry comes from the stored shot sizes, so the frame is laid out before the
 * image arrives — no shift. A component is a window onto its block: the image is
 * pulled up with a negative margin (a percentage of width, so it scales with the frame).
 */
export function CaptureScreen({ item, viewport, eager = false }: { item: Item; viewport?: Viewport; eager?: boolean }) {
  const cap = item.capture!;
  const vp = viewport ?? "desktop";
  const shot = cap.shots[vp];
  const crop = item.kind === "component" ? (cap.crops?.[vp] ?? (vp === "desktop" ? item.crop : undefined)) : undefined;
  /* a component with no match at this width falls back to the laptop crop */
  const useShot = item.kind === "component" && !crop ? cap.shots.desktop : shot;
  const useCrop = crop ?? (item.kind === "component" ? item.crop : undefined);

  const sizes = viewport ? "(max-width: 1024px) 100vw, 70vw" : "(max-width: 768px) 50vw, 340px";

  /* a feed card shows its still: just the top of the page, or just the block (lib/cards.ts) */
  const card = viewport ? null : cardOf(item);
  if (card) {
    const still = (
      <Image
        src={captureSrc(card.src)}
        width={card.w}
        height={card.h}
        sizes={sizes}
        alt={`${item.source.name} — ${item.title}`}
        draggable={false}
        style={{ display: "block", width: "100%", height: "auto", maxWidth: "none" }}
      />
    );
    /* a block wider than the frame (a thin navbar in a card) sits in the middle; a taller one shows its top */
    const letterbox = card.w / card.h > item.aspect;
    return (
      <div
        dir="ltr"
        style={{
          aspectRatio: String(item.aspect),
          width: "100%",
          overflow: "hidden",
          background: item.palette.bg,
          display: "flex",
          alignItems: letterbox ? "center" : "flex-start",
        }}
      >
        <div style={{ width: "100%" }}>{still}</div>
      </div>
    );
  }
  const img = (style?: React.CSSProperties) => (
    <Image
      src={captureSrc(useShot.src)}
      width={useShot.w}
      height={useShot.h}
      sizes={sizes}
      alt={`${item.source.name} — ${item.title}${viewport ? `, ${vp}` : ""}`}
      draggable={false}
      {...(eager ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
      style={{ display: "block", width: "100%", height: "auto", maxWidth: "none", ...style }}
    />
  );

  /* full page at a chosen width: natural height, the frame around it scrolls */
  if (viewport && !useCrop) return <div style={{ background: item.palette.bg }}>{img()}</div>;

  const offset = useCrop ? `-${((useCrop.y * useShot.docH) / useShot.css) * 100}%` : "0%";
  /* the block's own shape; a frame wider than it (a thin navbar in a card) letterboxes it */
  const blockAspect = useCrop ? useShot.css / (useCrop.h * useShot.docH) : undefined;
  const frameAspect = viewport && blockAspect ? blockAspect : item.aspect;
  const letterbox = blockAspect !== undefined && blockAspect > frameAspect;

  return (
    <div
      dir="ltr"
      style={{
        aspectRatio: String(frameAspect),
        width: "100%",
        overflow: "hidden",
        position: "relative",
        background: item.palette.bg,
        display: "flex",
        alignItems: letterbox ? "center" : "flex-start",
      }}
    >
      <div style={{ width: "100%", overflow: "hidden", aspectRatio: letterbox ? String(blockAspect) : undefined }}>
        {img({ marginTop: offset })}
      </div>
    </div>
  );
}
