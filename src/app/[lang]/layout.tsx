import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lexend, Readex_Pro, Space_Mono } from "next/font/google";
import { lang as rootLang } from "next/root-params";
import "../globals.css";
import { SavedProvider } from "@/components/save/SavedProvider";
import { THEME_SCRIPT } from "@/components/shell/Theme";
import { LangProvider } from "@/i18n/client";
import { dirOf, isLang, LOCALES } from "@/i18n/config";
import { DICTS } from "@/i18n/dict";
import { SITE_URL } from "@/lib/site";

const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });
const display = Lexend({ subsets: ["latin"], variable: "--font-lexend" });
/* Lexend's Arabic companion. Arabic glyphs only, not preloaded: unicode-range means a page
   fetches it only when Arabic text is on it, so English pages pay nothing. */
const arabic = Readex_Pro({ subsets: ["arabic"], variable: "--font-arabic", preload: false });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await rootLang();
  const t = DICTS[isLang(lang) ? lang : "en"].meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.title, template: t.template },
    description: t.description,
    openGraph: { siteName: "Uiverse", type: "website", locale: lang === "ar" ? "ar" : "en" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await rootLang();
  if (!isLang(lang)) notFound();
  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      suppressHydrationWarning
      className={`${mono.variable} ${display.variable} ${arabic.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <LangProvider lang={lang} t={DICTS[lang]}>
          <SavedProvider>{children}</SavedProvider>
        </LangProvider>
      </body>
    </html>
  );
}
