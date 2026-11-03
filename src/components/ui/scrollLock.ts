/**
 * Locks page scrolling while any overlay holds a lock. Counted rather than "remember what was
 * there": the detail overlay's shell and the overlay itself overlap for a moment and release in
 * either order, and a saved "hidden" restored last would leave the page unable to scroll.
 */
let holders = 0;

export function lockScroll() {
  if (holders++ === 0) document.body.style.overflow = "hidden";
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    if (--holders === 0) document.body.style.overflow = "";
  };
}
