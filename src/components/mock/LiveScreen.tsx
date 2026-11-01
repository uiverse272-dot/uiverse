"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Item } from "@/lib/data";
import { VIEWPORTS, type Viewport } from "./primitives";

/**
 * A Uiverse Original (lib/craft.ts). Same contract as MockScreen: without `viewport` it fills a
 * frame of `item.aspect` — its poster, which comes alive while a mouse rests on it — and with one
 * it's the piece itself, running at that width.
 *
 * The piece runs in a sandboxed frame (scripts, nothing else: no cookies, storage or navigation
 * of this page), from a file that makes no requests of its own.
 */
export function LiveScreen({ item, viewport, eager = false }: { item: Item; viewport?: Viewport; eager?: boolean }) {
  const live = item.live!;
  if (viewport) {
    /* a hero gets a real screen's height at each width; a widget, the frame it was made in */
    const height = item.kind === "screen" ? VIEWPORTS[viewport].h : Math.max(live.h, 520);
    return (
      <iframe
        src={live.src}
        title={item.title}
        sandbox="allow-scripts"
        loading={eager ? "eager" : "lazy"}
        style={{ display: "block", width: "100%", height, border: 0, background: item.palette.bg }}
      />
    );
  }
  return <Poster item={item} eager={eager} />;
}

function Poster({ item, eager }: { item: Item; eager: boolean }) {
  const live = item.live!;
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [play, setPlay] = useState<{ scale: number; x: number; y: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);
  /*
   * Fitting the still to a card of another shape: a portrait card shows a desktop page's tall still
   * (its top, edge to edge); a widget sits whole on its own background; a phone screen keeps its top.
   */
  const pa = live.w / live.h;
  const portrait = item.aspect < pa * 0.9;
  const tall = portrait && live.tall ? live.tall : null;
  const fit = item.kind === "component" ? "contain" : "cover";
  const anchor = tall || item.kind === "screen" ? "top" : "center";

  /* only a mouse that stays a moment: a fly-over or a touch scroll shouldn't start dozens of frames */
  const enter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      /* cover the card, as the poster does, when a card's frame isn't the piece's shape */
      /* the running piece takes the place of the still, framed the same way */
      if (tall) { const k = r.width / live.w; setPlay({ scale: k, x: 0, y: 0, h: r.height / k }); return; }
      const scale = (fit === "contain" ? Math.min : Math.max)(r.width / live.w, r.height / live.h);
      setPlay({ scale, x: (r.width - live.w * scale) / 2, y: anchor === "top" ? 0 : (r.height - live.h * scale) / 2, h: live.h });
    }, 220);
  };
  const leave = () => {
    clearTimeout(timer.current);
    setPlay(null);
    setReady(false);
  };

  return (
    <div
      ref={ref}
      onPointerEnter={enter}
      onPointerLeave={leave}
      style={{ position: "relative", aspectRatio: String(item.aspect), width: "100%", overflow: "hidden", background: item.palette.bg }}
    >
      <Image
        src={tall ? tall.src : live.poster}
        width={tall ? tall.w : live.w * live.scale}
        height={tall ? tall.h : live.h * live.scale}
        sizes="(max-width: 768px) 50vw, 340px"
        alt={item.title}
        draggable={false}
        {...(eager ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
        style={{ display: "block", width: "100%", height: "100%", objectFit: fit, objectPosition: anchor }}
      />
      {play ? (
        <iframe
          src={live.src}
          title={item.title}
          sandbox="allow-scripts"
          tabIndex={-1}
          aria-hidden
          onLoad={() => setReady(true)}
          style={{
            position: "absolute",
            left: play.x,
            top: play.y,
            width: live.w,
            height: play.h,
            border: 0,
            transform: `scale(${play.scale})`,
            transformOrigin: "0 0",
            /* the card is a link: clicks go through to it */
            pointerEvents: "none",
            opacity: ready ? 1 : 0,
            transition: "opacity .2s",
          }}
        />
      ) : null}
    </div>
  );
}
