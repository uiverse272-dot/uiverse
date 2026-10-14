/**
 * The guide advances on what people actually do, not on "Next" clicks. Components that own
 * those actions report them here; the guide listens. Firing with no guide running is a no-op.
 */
export type GuideEvent = "breakdown" | "prompt-open" | "prompt-close" | "prompt-copy" | "save";

const EVENT = "uiv:guide";
const START = "uiv:guide-start";

export const guideEvent = (name: GuideEvent): void => {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: name }));
};
export const onGuideEvent = (fn: (name: GuideEvent) => void) => {
  const h = (e: Event) => fn((e as CustomEvent<GuideEvent>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
};

/** Menus call this to (re)open the welcome — it works from any page. */
export const startGuide = (): void => {
  window.dispatchEvent(new Event(START));
};
export const onGuideStart = (fn: () => void) => {
  window.addEventListener(START, fn);
  return () => window.removeEventListener(START, fn);
};
