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
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen text-stone-900 antialiased selection:bg-rose-200 selection:text-rose-900`}>
        <div className="relative isolate min-h-screen overflow-hidden bg-background">
          {/* Animated dynamic background layers */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow opacity-30 animate-mesh" />
          <div className="pointer-events-none absolute -top-40 -right-40 -z-10 h-96 w-96 rounded-full bg-rose-200/40 blur-[100px] animate-float" />
          <div className="pointer-events-none absolute top-1/3 -left-20 -z-10 h-72 w-72 rounded-full bg-amber-200/40 blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
          
          <div className="relative z-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
