import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Roudomageirikes | Family Recipe Memories",
  description:
    "A warm personal recipe guide for preserving favorite dishes, little kitchen rituals, and the stories that travel with them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f8f2e8] text-stone-900 antialiased`}>
        <div className="relative isolate min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,247,237,0.8),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_bottom,rgba(254,215,170,0.35),transparent_60%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
