import { rootMetadata } from "@/app/_shared/root-layout";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

// Greek metadata by default: the 404 page and the Greek pages use it as is, and
// app/[locale]/layout.tsx overrides it for the other languages.
export const metadata = rootMetadata(DEFAULT_LOCALE);

/**
 * Passes children through without rendering <html>. Each language renders its own
 * <html lang> in app/(el)/layout.tsx and app/[locale]/layout.tsx, and
 * app/not-found.tsx renders the Greek one. A top-level layout still has to exist:
 * without it, Next 14 builds the default unstyled 404 page instead of not-found.tsx.
 */
export default function PassThroughLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
