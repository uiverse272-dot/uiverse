import { notFound } from "next/navigation";

/**
 * Unmatched URLs. With the root layout under [lang], a path no route matches never reaches
 * [lang]/not-found.tsx on its own — it gets Next's bare default 404. Matching everything that's
 * left and calling notFound() renders the real one, in the page's language, with a 404 status.
 * Named like the @modal slot's catch-all: Next requires one name per position.
 */
export default function CatchAll() {
  notFound();
}
