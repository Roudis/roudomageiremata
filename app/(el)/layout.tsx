import { RootLayout } from "@/app/_shared/root-layout";

// Greek, the site's original language, keeps the unprefixed URLs: "/" and "/recipes/<id>".
// Its metadata comes from app/layout.tsx. The other languages live in app/[locale].
export default function GreekLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootLayout locale="el">{children}</RootLayout>;
}
