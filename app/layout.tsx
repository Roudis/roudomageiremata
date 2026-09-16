import type { Metadata } from "next";
import { Commissioner, Literata } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

// Both fonts include Greek glyphs. next/font downloads them at build time and serves them
// from the static export, so visitors never contact Google.
const sans = Commissioner({
  subsets: ["greek", "latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Literata({
  subsets: ["greek", "latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base for Open Graph image URLs. The site lives under /roudomageiremata on
  // GitHub Pages, which withBasePath adds to each image path, so this is the origin only.
  metadataBase: new URL("https://roudis.github.io"),
  title: {
    default: "Ρουδομαγειρέματα | Οικογενειακές Συνταγές",
    template: "%s | Ρουδομαγειρέματα",
  },
  description:
    "Ένας ζεστός, προσωπικός οδηγός με τις αγαπημένες μας συνταγές, τα μικρά μυστικά της κουζίνας μας και τις ιστορίες που τις συνοδεύουν.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
