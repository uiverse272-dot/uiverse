/**
 * A card grows into its detail view and shrinks back into it.
 *
 * The card notes where its picture sits as it's clicked (markSource); the overlay, when it opens,
 * flies a copy of that picture from there into its frame, then lets the frame show through
 * (playOpen). Closing flies the frame's picture back onto the card, if the card is still on
 * screen (playClose). The overlay keeps the feed mounted underneath, so the card and the frame
 * exist at once — view-transition names can't pair them, a copy that moves can.
 *
 * The click shows the overlay's empty shell at once (openShell; it's drawn in the browser, so no
 * request stands between the click and the answer), and the copy flies into the shell's frame
 * (flyToShell). When the real detail view arrives it takes the copy over and
 * moves it the last few pixels into its own frame; if the shell goes with nothing to take over,
 * the copy fades away.
 */

type Source = { slug: string; plate: HTMLElement; rect: DOMRect; src: string | null; bg: string };
let pending: Source | null = null;
let last: Source | null = null;
let flight: { slug: string; el: HTMLElement; fly: Animation } | null = null;
let shell = false;

/* the shell on screen, if any: which kind of detail view it stands in for */
type Kind = "screen" | "component";
let opening: Kind | null = null;
const listeners = new Set<() => void>();
const tell = () => listeners.forEach((l) => l());
export const shellStore = {
  subscribe: (l: () => void) => (listeners.add(l), () => void listeners.delete(l)),
  get: () => opening,
  server: () => null,
};
export function openShell(kind: Kind) {
  opening = kind;
  tell();
}
export function closeShell() {
  if (opening === null) return;
  opening = null;
  tell();
}

const EASE = "cubic-bezier(0.2, 0, 0, 1)";
export const still = () => typeof window === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches;

/* the card's preview, at the moment it's clicked */
export function markSource(slug: string, plate: HTMLElement) {
  const img = plate.querySelector("img");
  pending = {
    slug,
    plate,
    rect: plate.getBoundingClientRect(),
    src: img ? img.currentSrc || img.src : null,
    bg: getComputedStyle(plate).backgroundColor,
  };
}

/* read during the overlay's first render: does a card hand over to it? */
export const peekSource = (slug: string) => (pending?.slug === slug || flight?.slug === slug ? slug : null);
/* read during the overlay's first render: did its loading shell just stand in for it? */
export const shellWasUp = () => shell;

function copy(rect: DOMRect, src: string | null, bg: string) {
  const el = document.createElement(src ? "img" : "div");
  if (src) {
    (el as HTMLImageElement).src = src;
    (el as HTMLImageElement).alt = "";
  }
  Object.assign(el.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    objectFit: "cover",
    objectPosition: "top",
    background: bg,
    zIndex: "95",
    pointerEvents: "none",
    margin: "0",
  });
  el.setAttribute("aria-hidden", "true");
  document.body.append(el);
  return el;
}

const box = (r: DOMRect) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });

/* the frame's own picture or page, once it can be seen: then the copy steps aside */
function ready(frame: HTMLElement) {
  const media = frame.querySelector("iframe, img") as HTMLIFrameElement | HTMLImageElement | null;
  const loaded = !media || (media instanceof HTMLImageElement && media.complete);
  if (loaded) return Promise.resolve();
  return new Promise<void>((done) => {
    media.addEventListener("load", () => done(), { once: true });
    setTimeout(done, 700);
  });
}

const fadeAway = (el: HTMLElement, ms = 180) =>
  el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: "ease-out", fill: "forwards" }).finished.then(() => el.remove());

export function flyToShell(frame: HTMLElement | null) {
  shell = true;
  const s = pending;
  pending = null;
  if (!s || !frame || still()) return;
  last = s;
  const el = copy(s.rect, s.src, s.bg);
  const fly = el.animate([box(s.rect), box(frame.getBoundingClientRect())], { duration: 380, easing: EASE, fill: "forwards" });
  flight = { slug: s.slug, el, fly };
}

/* the shell is gone: the detail view that replaced it has had its chance to take the copy */
export function leaveShell() {
  setTimeout(() => {
    shell = false;
    if (flight) fadeAway(flight.el);
    flight = null;
  }, 60);
}

export function playOpen(slug: string, frame: HTMLElement | null) {
  if (flight?.slug === slug) {
    const { el, fly } = flight;
    flight = null;
    if (!frame) return void fadeAway(el);
    const now = el.getBoundingClientRect();
    fly.cancel();
    Object.assign(el.style, box(now));
    frame.style.opacity = "0";
    const move = el.animate([box(now), box(frame.getBoundingClientRect())], { duration: 260, easing: EASE, fill: "forwards" });
    void Promise.all([move.finished, ready(frame)]).then(() => {
      frame.style.opacity = "";
      void fadeAway(el, 120);
    });
    return;
  }
  const s = pending?.slug === slug ? pending : null;
  pending = null;
  if (!s || !frame || still()) return;
  last = s;
  const to = frame.getBoundingClientRect();
  const el = copy(s.rect, s.src, s.bg);
  /* the frame waits under the copy, so the two are never seen at once */
  frame.style.opacity = "0";
  const fly = el.animate([box(s.rect), box(to)], { duration: 380, easing: EASE, fill: "forwards" });
  /* the copy and the live frame rarely match pixel for pixel, so the handover is quick */
  void Promise.all([fly.finished, ready(frame)]).then(() => {
    frame.style.opacity = "";
    void fadeAway(el, 120);
  });
}

/* back onto the card it came from, when that card is in view; true if it played */
export function playClose(slug: string, frame: HTMLElement | null) {
  const s = last?.slug === slug ? last : null;
  last = null;
  if (!s || !frame || still() || !s.plate.isConnected) return false;
  const to = s.plate.getBoundingClientRect();
  if (to.bottom < 0 || to.top > innerHeight || to.width === 0) return false;
  const from = frame.getBoundingClientRect();
  const el = copy(from, s.src, s.bg);
  el.animate([box(from), box(to)], { duration: 320, easing: EASE, fill: "forwards" }).finished.then(() =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: "forwards" }).finished.then(() => el.remove()),
  );
  return true;
}
