"use client";

import { useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { layoutName } from "@/i18n/content";
import { fill } from "@/i18n/format";
import { ARCHETYPES, type Archetype } from "@/lib/archetypes";
import { PALETTES } from "@/lib/palettes";
import {
  boxesFrom, closestArchetype, FRAME, guessType, ordered, sketchItem, SKETCH_TYPES,
  type Box, type Device,
} from "@/lib/sketch";
import { CATEGORIES, COMPONENT_TYPES, INDUSTRIES, localTerms, name, STYLES } from "@/lib/taxonomy";
import { PromptDialog } from "../prompt/PromptDialog";
import { FIELD } from "../ui/field";
import { Close, Plus, Sparkle } from "../ui/icons";

type Drag = { mode: "draw" | "move" | "resize"; id: string; x0: number; y0: number; orig: Box };

/* boxes smaller than this on release were a click, not a drawing */
const MIN_W = 0.04;
const MIN_H = 0.015;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const archName = (a: Archetype) => a.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Draw a page as boxes, get a prompt. Each box is a section whose type is guessed from where it
 * sits (lib/sketch) and shown on the box, so a wrong guess is one select away from right. The
 * list beside the frame is the same sections in reading order — and the keyboard way to build one.
 */
export function SketchPad() {
  const { lang, t } = useI18n();
  const s = t.sketch;
  const [device, setDevice] = useState<Device>("desktop");
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [paletteKey, setPaletteKey] = useState(PALETTES[0].key);
  const [industry, setIndustry] = useState<string>("saas");
  const [style, setStyle] = useState<string>("minimal");
  const [pick, setPick] = useState<Archetype | "">("");
  const [open, setOpen] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const nextId = useRef(1);

  const palette = PALETTES.find((p) => p.key === paletteKey) ?? PALETTES[0];
  const list = useMemo(() => ordered(boxes), [boxes]);
  const best = list.length ? closestArchetype(list.map((b) => b.type), device) : null;
  /* a pick made on the other device doesn't apply here */
  const chosen = pick && ARCHETYPES[pick].device === device ? pick : undefined;
  const item = useMemo(
    () => sketchItem(boxes, { device, palette, industry, style, archetype: chosen }, s.source),
    [boxes, device, palette, industry, style, chosen, s.source],
  );

  const point = (e: React.PointerEvent) => {
    const r = frame.current!.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) };
  };
  const update = (id: string, patch: Partial<Box>) =>
    setBoxes((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id: string) => {
    setBoxes((bs) => bs.filter((b) => b.id !== id));
    setSelected(null);
  };

  const startDraw = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const { x, y } = point(e);
    const id = `n${nextId.current++}`;
    const box: Box = { id, x, y, w: 0, h: 0, type: "cards" };
    drag.current = { mode: "draw", id, x0: x, y0: y, orig: box };
    setBoxes((bs) => [...bs, box]);
    setSelected(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const startEdit = (e: React.PointerEvent, b: Box, mode: "move" | "resize") => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const { x, y } = point(e);
    drag.current = { mode, id: b.id, x0: x, y0: y, orig: b };
    setSelected(b.id);
    frame.current!.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const { x, y } = point(e);
    const o = d.orig;
    if (d.mode === "draw") {
      update(d.id, { x: Math.min(x, d.x0), y: Math.min(y, d.y0), w: Math.abs(x - d.x0), h: Math.abs(y - d.y0) });
    } else if (d.mode === "move") {
      update(d.id, { x: clamp(o.x + x - d.x0, 0, 1 - o.w), y: clamp(o.y + y - d.y0, 0, 1 - o.h) });
    } else {
      update(d.id, { w: clamp(o.w + x - d.x0, MIN_W, 1 - o.x), h: clamp(o.h + y - d.y0, MIN_H, 1 - o.y) });
    }
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.mode !== "draw") return;
    setBoxes((bs) => {
      const b = bs.find((x) => x.id === d.id);
      if (!b || b.w < MIN_W || b.h < MIN_H) return bs.filter((x) => x.id !== d.id);
      const others = bs.filter((x) => x.id !== d.id);
      return [...others, { ...b, type: guessType(b, device, others) }];
    });
  };

  /* the keyboard path: a full-width section under the lowest one, typed like a drawn box */
  const add = () => {
    const bottom = boxes.reduce((m, b) => Math.max(m, b.y + b.h), 0);
    const h = Math.min(0.12, 1 - bottom);
    if (h < MIN_H) return;
    const id = `n${nextId.current++}`;
    const box = { id, x: 0, y: bottom + (bottom ? 0.01 : 0), w: 1, h: h - (bottom ? 0.01 : 0) };
    setBoxes((bs) => [...bs, { ...box, type: guessType(box, device, bs) }]);
    setSelected(id);
  };

  const startFrom = (a: string) => {
    setBoxes(a ? boxesFrom(a as Archetype) : []);
    setSelected(null);
  };

  const starts = (Object.keys(ARCHETYPES) as Archetype[]).filter((a) => ARCHETYPES[a].device === device);
  const typeName = (type: string) => name(COMPONENT_TYPES, type, lang);
  const pos = (b: Box) => list.findIndex((x) => x.id === b.id) + 1;

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* ------------------------------------------------------------- frame */}
      <div>
        <div className="flex flex-wrap items-center gap-3 pb-3">
          <div role="group" aria-label={s.device} className="flex border border-border">
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                aria-pressed={device === d}
                className={`px-3 py-1.5 text-[12.5px] font-medium ${device === d ? "bg-accent text-accent-fg" : "hover:bg-bg-subtle"}`}
              >
                {s[d]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[12.5px] text-text-3">
            {s.startFrom}
            <select
              key={device}
              defaultValue=""
              onChange={(e) => startFrom(e.target.value)}
              className="border border-border bg-bg-subtle px-2 py-1.5 text-[12.5px] text-text"
            >
              <option value="">{s.blank}</option>
              {starts.map((a) => (
                <option key={a} value={a}>
                  {layoutName(a, archName(a), lang)}
                </option>
              ))}
            </select>
          </label>
          {boxes.length ? (
            <button onClick={() => startFrom("")} className="ms-auto text-[12.5px] text-text-3 underline underline-offset-2 hover:text-text">
              {s.clear}
            </button>
          ) : null}
        </div>

        {/* a picture of a design: drawn left to right in either page language */}
        <div
          ref={frame}
          dir="ltr"
          role="application"
          aria-label={s.frame}
          onPointerDown={startDraw}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="relative mx-auto cursor-crosshair touch-none select-none border border-border-strong"
          style={{
            aspectRatio: FRAME[device],
            /* never full width: the frame takes every touch, so the page needs margin to scroll from */
            width: `min(88%, calc(min(72vh, 780px) * ${FRAME[device]}))`,
            background: palette.bg,
            backgroundImage: `radial-gradient(${palette.border} 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        >
          {!boxes.length ? (
            <p className="pointer-events-none absolute inset-0 grid place-items-center p-6 text-center text-[13px]" style={{ color: palette.muted }}>
              {s.hint}
            </p>
          ) : null}
          {boxes.map((b) => {
            const on = selected === b.id;
            return (
              <div
                key={b.id}
                tabIndex={0}
                aria-label={`${pos(b)}. ${typeName(b.type)}`}
                onPointerDown={(e) => startEdit(e, b, "move")}
                onFocus={() => setSelected(b.id)}
                onKeyDown={(e) => {
                  if (e.key === "Delete" || e.key === "Backspace") {
                    e.preventDefault();
                    remove(b.id);
                    return;
                  }
                  const step = e.shiftKey ? 0.05 : 0.01;
                  const [dx, dy] = ({ ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] } as Record<string, number[]>)[e.key] ?? [0, 0];
                  if (!dx && !dy) return;
                  e.preventDefault();
                  update(b.id, { x: clamp(b.x + dx, 0, 1 - b.w), y: clamp(b.y + dy, 0, 1 - b.h) });
                }}
                className="absolute cursor-move overflow-hidden outline-none"
                style={{
                  left: `${b.x * 100}%`,
                  top: `${b.y * 100}%`,
                  width: `${b.w * 100}%`,
                  height: `${b.h * 100}%`,
                  background: palette.surface,
                  border: `${on ? 2 : 1}px ${on ? "solid" : "dashed"} ${on ? palette.accent : palette.muted}`,
                }}
              >
                <span
                  className="absolute start-1 top-1 whitespace-nowrap px-1 font-mono text-[10.5px]"
                  style={{ color: palette.text, background: palette.raised }}
                >
                  {pos(b)} · {typeName(b.type)}
                </span>
                <span
                  aria-hidden
                  onPointerDown={(e) => startEdit(e, b, "resize")}
                  className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize"
                  style={{ background: on ? palette.accent : palette.muted }}
                />
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-2 max-w-xl text-center text-[12px] text-text-3">{s.help}</p>
      </div>

      {/* ------------------------------------------------------------ panel */}
      <div className="space-y-4">
        <div className="border border-border bg-surface p-4">
          <div className="flex items-baseline justify-between pb-2">
            <h2 className="text-[13px] font-semibold">{s.sections}</h2>
            {best ? (
              <label className="flex items-center gap-1.5 text-[12px] text-text-3">
                {s.readsAs}
                <select
                  value={chosen ?? ""}
                  onChange={(e) => setPick(e.target.value as Archetype | "")}
                  className="max-w-[210px] bg-transparent py-0.5 text-[12px] text-text outline-none"
                >
                  <option value="">{fill(s.auto, { name: layoutName(best, archName(best), lang) })}</option>
                  {starts.map((a) => (
                    <option key={a} value={a}>
                      {layoutName(a, archName(a), lang)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          {list.length ? (
            <ol className="space-y-1">
              {list.map((b, i) => (
                <li
                  key={b.id}
                  className={`flex items-center gap-2 border px-2 py-1 ${selected === b.id ? "border-border-strong bg-bg-subtle" : "border-transparent"}`}
                >
                  <span className="w-4 font-mono text-[10.5px] text-text-3 tabular-nums">{i + 1}</span>
                  <select
                    aria-label={s.type}
                    value={b.type}
                    onFocus={() => setSelected(b.id)}
                    onChange={(e) => update(b.id, { type: e.target.value })}
                    className="min-w-0 flex-1 bg-transparent py-1 text-[12.5px] outline-none"
                  >
                    {SKETCH_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {typeName(type)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(b.id)}
                    aria-label={fill(s.remove, { name: typeName(b.type) })}
                    className="flex h-6 w-6 items-center justify-center text-text-3 hover:text-text"
                  >
                    <Close size={13} />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-2 text-[12.5px] text-text-3">{s.empty}</p>
          )}
          <button
            onClick={add}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 border border-dashed border-border py-1.5 text-[12.5px] text-text-2 hover:bg-bg-subtle hover:text-text"
          >
            <Plus size={13} /> {s.add}
          </button>
        </div>

        <div className="border border-border bg-surface p-4">
          <h2 className="pb-2 text-[13px] font-semibold">{s.look}</h2>
          <div className="pb-1.5 text-[12px] text-text-3">{s.palette}</div>
          <div role="radiogroup" aria-label={s.palette} className="grid grid-cols-8 gap-1.5">
            {PALETTES.map((p) => (
              <button
                key={p.key}
                role="radio"
                aria-checked={p.key === paletteKey}
                aria-label={p.name}
                title={p.name}
                onClick={() => setPaletteKey(p.key)}
                className={`flex h-7 overflow-hidden border ${p.key === paletteKey ? "border-text outline outline-2 outline-offset-1 outline-text" : "border-border"}`}
              >
                <span className="flex-1" style={{ background: p.bg }} />
                <span className="w-1/3" style={{ background: p.accent }} />
              </button>
            ))}
          </div>
          <label className="mt-3 block text-[12px] text-text-3">
            {s.industry}
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={`mt-1 ${FIELD} h-9 text-[13px]`}>
              {localTerms(INDUSTRIES, lang).map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-[12px] text-text-3">
            {s.style}
            <select value={style} onChange={(e) => setStyle(e.target.value)} className={`mt-1 ${FIELD} h-9 text-[13px]`}>
              {localTerms(STYLES, lang).map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={() => setOpen(true)}
          disabled={!list.length}
          className="inline-flex h-11 w-full items-center justify-center gap-2 bg-accent text-[14px] font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Sparkle size={15} /> {s.generate}
        </button>
        {!list.length ? <p className="text-center text-[12px] text-text-3">{s.needOne}</p> : null}
      </div>

      {open && list.length ? (
        <PromptDialog
          item={item}
          title={name(CATEGORIES, item.category, lang)}
          saveable={false}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
