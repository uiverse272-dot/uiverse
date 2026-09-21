import type { Metadata } from "next";
import "./globals.css";
import { SavedProvider } from "@/components/save/SavedProvider";
import { THEME_SCRIPT } from "@/components/shell/Theme";

export const metadata: Metadata = {
  title: "Uiverse — Discover interfaces worth building",
  description:
    "A visual index of how real interfaces are built. Browse websites, apps and components, save what works, and understand how it was made.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <SavedProvider>{children}</SavedProvider>
      </body>
    </html>
  );
}
