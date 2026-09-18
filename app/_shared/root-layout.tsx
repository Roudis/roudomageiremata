import type { Metadata } from "next";
import { Commissioner, Literata } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SITE_NAME, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import "@/app/globals.css";

// Both fonts include Greek glyphs; latin covers the accents of the Western European
// languages, and latin-ext the Romanian and Czech letters such as ș, ț, č, and ř. next/font downloads them at build time and serves them from the static
// export, so visitors never contact Google.
const sans = Commissioner({
  subsets: ["greek", "latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Literata({
  subsets: ["greek", "latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

/** Site-wide metadata for one language's pages. */
export function rootMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    // Absolute base for Open Graph and alternate-language URLs. The site lives under
    // /roudomageiremata on GitHub Pages, which withBasePath adds to each path, so this
    // is the origin only.
    metadataBase: new URL("https://roudis.github.io"),
    // `absolute` rather than `default`, so app/layout.tsx's template is not applied to
    // app/[locale]/layout.tsx's title a second time.
    title: {
      absolute: `${SITE_NAME} | ${t.site.tagline}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: t.site.description,
  };
}

type RootLayoutProps = {
  locale: Locale;
  /** Where the language menu's entries point; see Navbar. */
  switcherPath?: string;
  children: React.ReactNode;
};

/**
 * The <html> shell for one language. app/(el)/layout.tsx, app/[locale]/layout.tsx,
 * and app/not-found.tsx each render it, so <html lang> is right on every page;
 * app/layout.tsx only passes children through.
 */
export function RootLayout({ locale, switcherPath, children }: RootLayoutProps) {
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Navbar locale={locale} switcherPath={switcherPath} />
        <div className="flex-1">{children}</div>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
