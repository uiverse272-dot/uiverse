"use client";

import { useI18n, useLocalPath } from "@/i18n/client";
import { LANG_COOKIE, localize } from "@/i18n/config";

/**
 * Names the other language in that language ("العربية" / "English") and goes to this same page
 * in it, query string included. The choice is remembered (the proxy reads the cookie), so an
 * unprefixed link shared later still opens in Arabic for someone who picked it.
 *
 * A full load rather than a client navigation: <html lang dir>, the font and every string change.
 */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, t } = useI18n();
  const path = useLocalPath();
  const other = lang === "ar" ? "en" : "ar";
  const href = localize(other, path);
  return (
    /* a plain anchor: a language change reloads the document on purpose */
    <a
      href={href}
      hrefLang={other}
      lang={other}
      title={t.lang.label}
      onClick={(e) => {
        e.preventDefault();
        document.cookie = `${LANG_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
        window.location.assign(href + window.location.search);
      }}
      className={className}
    >
      {t.lang.other}
    </a>
  );
}
