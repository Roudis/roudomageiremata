"use client";

import { useRouter, usePathname } from "next/navigation";
import { Locale } from "@/lib/i18n";

export function LanguageToggle({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = currentLocale === "el" ? "en" : "el";
    const newPath = pathname ? pathname.replace(`/${currentLocale}`, `/${newLocale}`) : `/${newLocale}`;
    router.push(newPath);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-6 right-6 z-50 flex items-center justify-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-900/10 backdrop-blur-md transition-all hover:bg-stone-50 hover:text-stone-900 hover:ring-stone-900/20"
      aria-label="Toggle language"
    >
      {currentLocale === "el" ? "🇬🇧 English" : "🇬🇷 Ελληνικά"}
    </button>
  );
}
