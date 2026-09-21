import { ARCHETYPES, ITEMS, type Archetype } from "@/lib/data";
import { MockScreen } from "@/components/mock/MockScreen";

/**
 * Dev tool, not a product page.
 *
 * Renders every archetype at its design width with height unconstrained, so the
 * natural content height can be measured and baked back into ARCHETYPES. Those
 * heights are what let the masonry lay out from numbers alone, with no measuring
 * and no shift. Re-run after changing any section:
 *
 *   [...document.querySelectorAll('[data-arch]')]
 *     .map(e => [e.dataset.arch, Math.round(e.getBoundingClientRect().height)])
 */
export default function DevMeasure() {
  const keys = Object.keys(ARCHETYPES) as Archetype[];
  return (
    <div>
      {keys.map((k) => {
        const item = ITEMS.find((i) => i.archetype === k && i.kind === "screen")!;
        const w = ARCHETYPES[k].w;
        return (
          <div key={k} data-arch={k} data-w={w} style={{ width: w, outline: "1px solid red" }}>
            <MockScreen item={item} measure />
          </div>
        );
      })}
    </div>
  );
}
