"use client";

import { Fragment } from "react";
import { useI18n } from "@/i18n/client";

/**
 * A reflow rule — "48px → 36px → 24px; 3 columns → 2 → 1" — with each step isolated. Steps
 * like "48px" are left-to-right runs, so inside Arabic text the browser would lay the whole
 * chain out left to right with the arrows pointing the wrong way; isolating each step lets
 * the chain follow the paragraph, and the arrow is the one that points along it.
 */
export function Flow({ text }: { text: string }) {
  const { lang, t } = useI18n();
  return (
    <>
      {text.split(/;\s|؛\s/).map((clause, i) => (
        <Fragment key={i}>
          {i ? (lang === "ar" ? "؛ " : "; ") : null}
          {clause.split(" → ").map((step, j) => (
            <Fragment key={j}>
              {j ? ` ${t.common.arrow} ` : null}
              <bdi>{step}</bdi>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </>
  );
}
