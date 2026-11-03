import type { SyntheticEvent } from "react";

/**
 * An image marked `data-fade` stays transparent until it has loaded, then fades in
 * (globals.css). next/image also calls onLoad for an image that finished before the page
 * hydrated, so none is left hidden; without scripts, a <noscript> rule shows them all.
 */
export const fadeIn = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.dataset.loaded = "";
};
