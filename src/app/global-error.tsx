"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/*
 * The root layout itself threw, so nothing of it is here: no LangProvider, no globals.css, no
 * theme. Its own document and inline styles, and its few strings inline too — importing the
 * dictionaries would put both languages in every page's bundle. Wording matches dict `error`.
 */
const COPY = {
  en: { title: "Something went wrong", body: "This page hit an error. Try again, or head back to the feed.", retry: "Try again", back: "Back to the feed" },
  ar: { title: "حدث خطأ ما", body: "تعذّر عرض هذه الصفحة. حاول مجددًا، أو عُد إلى القائمة.", retry: "حاول مجددًا", back: "العودة إلى القائمة" },
};

const CSS = `
:root{--bg:#fdf1d6;--text:#1c1b18;--text-2:#4d4a42;--border:#1c1b18;--accent:#f47a2c;--accent-fg:#1c1b18}
@media (prefers-color-scheme:dark){:root{--bg:#1b1915;--text:#f5ead2;--text-2:#c3b89e;--border:#d8caa9;--accent:#f47a2c;--accent-fg:#1b1915}}
body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px;box-sizing:border-box;text-align:center;
background:var(--bg);color:var(--text);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:-.01em}
h1{margin:0;font-size:22px;font-weight:600;letter-spacing:-.02em}
p{margin:8px auto 0;max-width:420px;font-size:14px;color:var(--text-2)}
.row{margin-top:20px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.btn{display:inline-flex;align-items:center;height:40px;padding:0 16px;font:inherit;font-size:13.5px;font-weight:500;
border:1px solid var(--border);color:var(--text);background:none;text-decoration:none;cursor:pointer}
.btn.go{background:var(--accent);color:var(--accent-fg);border-color:var(--accent)}
`;

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const lang = /^\/ar(\/|$)/.test(usePathname() ?? "") ? "ar" : "en";
  const t = COPY[lang];
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        <title>{t.title}</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <main role="alert">
          <h1>{t.title}</h1>
          <p>{t.body}</p>
          <div className="row">
            <button className="btn go" onClick={retry}>
              {t.retry}
            </button>
            {/* a full load, not a client navigation: the router is what broke */}
            <a className="btn" href={lang === "ar" ? "/ar" : "/"}>
              {t.back}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
