import type { CSSProperties, ReactNode } from "react";

export type U = (n: number) => string;

/**
 * The three widths every design is drawn at. Units are design pixels *at that
 * width*, so a 14px label is 14px on the phone and on the laptop alike — the
 * layout reflows instead of the whole drawing being scaled down.
 */
export type Viewport = "desktop" | "tablet" | "mobile";
export const VIEWPORTS: Record<Viewport, { w: number; h: number; label: string }> = {
  desktop: { w: 1440, h: 900, label: "Laptop" },
  tablet: { w: 834, h: 1194, label: "Tablet" },
  mobile: { w: 390, h: 844, label: "Mobile" },
};

/** `const v = pick(vp)` then `v(desktop, tablet, mobile)` */
export const pick =
  (vp: Viewport) =>
  <T,>(d: T, t: T, m: T): T =>
    vp === "desktop" ? d : vp === "tablet" ? t : m;

export const mkU =
  (W: number): U =>
  (n: number) =>
    `${((n / W) * 100).toFixed(4)}cqw`;

/**
 * Deterministic 0..1 from two ints — used for chart bars and line widths.
 *
 * Integer ops only, and rounded to 4dp. Math.sin is NOT bit-identical between
 * V8 builds, so a trig-based hash renders different values on the Node server
 * and in the browser, which shows up as a hydration mismatch.
 */
export function noise(a: number, b = 1) {
  let t = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  t = Math.imul(t ^ (t >>> 13), 1274126177);
  t = (t ^ (t >>> 16)) >>> 0;
  return Math.round((t / 4294967296) * 10000) / 10000;
}

export function B({
  u,
  w,
  h,
  r,
  bg,
  border,
  style,
  children,
  grow,
}: {
  u: U;
  w?: number | string;
  h?: number | string;
  r?: number;
  bg?: string;
  border?: string;
  style?: CSSProperties;
  children?: ReactNode;
  grow?: boolean;
}) {
  return (
    <div
      style={{
        width: typeof w === "number" ? u(w) : w,
        height: typeof h === "number" ? u(h) : h,
        borderRadius: r ? u(r) : undefined,
        background: bg,
        border: border ? `${u(1)} solid ${border}` : undefined,
        flexGrow: grow ? 1 : undefined,
        flexShrink: 0,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Row({
  u,
  gap = 0,
  align = "center",
  justify,
  style,
  children,
  wrap,
  grow,
}: {
  u: U;
  gap?: number;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  style?: CSSProperties;
  children?: ReactNode;
  wrap?: boolean;
  grow?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: u(gap),
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        flexGrow: grow ? 1 : undefined,
        minHeight: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Col({
  u,
  gap = 0,
  align,
  justify,
  style,
  children,
  grow,
}: {
  u: U;
  gap?: number;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  style?: CSSProperties;
  children?: ReactNode;
  grow?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: u(gap),
        alignItems: align,
        justifyContent: justify,
        flexGrow: grow ? 1 : undefined,
        minHeight: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function T({
  u,
  size,
  weight = 400,
  color,
  children,
  style,
  track,
}: {
  u: U;
  size: number;
  weight?: number;
  color?: string;
  children?: ReactNode;
  style?: CSSProperties;
  track?: number;
}) {
  return (
    <div
      style={{
        fontSize: u(size),
        fontWeight: weight,
        color,
        lineHeight: 1.16,
        letterSpacing: track ? `${track}em` : size > 40 ? "-0.028em" : "-0.011em",
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** a placeholder text bar */
export function Line({
  u,
  w,
  h = 10,
  c,
  o = 0.18,
  r = 3,
}: {
  u: U;
  w: number | string;
  h?: number;
  c: string;
  o?: number;
  r?: number;
}) {
  return <B u={u} w={w} h={h} r={r} bg={c} style={{ opacity: o }} />;
}

export function Lines({
  u,
  n,
  w = "100%",
  h = 10,
  gap = 8,
  c,
  o = 0.15,
  last = 0.6,
}: {
  u: U;
  n: number;
  w?: number | string;
  h?: number;
  gap?: number;
  c: string;
  o?: number;
  last?: number;
}) {
  return (
    <Col u={u} gap={gap} style={{ width: typeof w === "number" ? u(w) : w }}>
      {Array.from({ length: n }).map((_, i) => (
        <Line
          key={i}
          u={u}
          w={i === n - 1 ? `${last * 100}%` : "100%"}
          h={h}
          c={c}
          o={o}
        />
      ))}
    </Col>
  );
}

export function Circle({ u, s, bg, style }: { u: U; s: number; bg?: string; style?: CSSProperties }) {
  return <B u={u} w={s} h={s} r={999} bg={bg} style={style} />;
}

export function Btn({
  u,
  label,
  w = 132,
  h = 44,
  r = 8,
  bg,
  fg,
  size = 15,
  border,
}: {
  u: U;
  label?: string;
  /** 0 = fill the parent's width */
  w?: number;
  h?: number;
  r?: number;
  bg?: string;
  fg?: string;
  size?: number;
  border?: string;
}) {
  return (
    <B
      u={u}
      w={w === 0 ? "100%" : w}
      h={h}
      r={r}
      bg={bg}
      border={border}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {label ? (
        <T u={u} size={size} weight={520} color={fg}>
          {label}
        </T>
      ) : null}
    </B>
  );
}

/** Equal-width columns; `cols` changes per viewport where Row + grow can't wrap. */
export function Grid({
  u,
  cols,
  gap = 0,
  rowGap,
  style,
  children,
}: {
  u: U;
  cols: number;
  gap?: number;
  rowGap?: number;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        columnGap: u(gap),
        rowGap: u(rowGap ?? gap),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** The collapsed-navigation affordance. */
export function Burger({ u, c, s = 22 }: { u: U; c: string; s?: number }) {
  return (
    <Col u={u} gap={s * 0.22} style={{ width: u(s) }}>
      {[0, 1, 2].map((i) => (
        <B key={i} u={u} w={s} h={s * 0.09} r={2} bg={c} style={{ opacity: 0.8 }} />
      ))}
    </Col>
  );
}
