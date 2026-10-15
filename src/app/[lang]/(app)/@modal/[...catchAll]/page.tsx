/**
 * Soft navigation keeps a parallel slot's last page even when the new URL doesn't match it,
 * so following any link out of the detail overlay would leave the overlay on screen.
 * Matching every other route here and rendering nothing is what closes it.
 */
export default function CatchAll() {
  return null;
}
