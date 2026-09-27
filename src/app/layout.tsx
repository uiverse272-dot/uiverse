import type { Metadata } from "next";
import { Lexend, Space_Mono } from "next/font/google";
import "./globals.css";
import { SavedProvider } from "@/components/save/SavedProvider";
import { THEME_SCRIPT } from "@/components/shell/Theme";

const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });
const display = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

export const metadata: Metadata = {
  title: "Uiverse — Discover interfaces worth building",
  description:
    "A visual index of how real interfaces are built. Browse websites, apps and components, save what works, and understand how it was made.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${mono.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <SavedProvider>{children}</SavedProvider>
      </body>
    </html>
  );
}
