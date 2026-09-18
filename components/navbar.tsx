import Link from "next/link";
import { BookOpen } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SITE_NAME, localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type NavbarProps = {
  locale: Locale;
  /**
   * The Greek path the language menu links to in each language. Defaults to the
   * page being viewed; the 404 page passes "/" so the menu leads somewhere real.
   */
  switcherPath?: string;
};

export function Navbar({ locale, switcherPath }: NavbarProps) {
  const t = getMessages(locale).nav;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-3">
        <Link
          href={localizePath("/", locale)}
          className="group flex min-w-0 items-center gap-2.5 rounded-md sm:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label={t.home}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary font-serif text-lg font-semibold text-primary-foreground"
          >
            Ρ
          </span>
          {/* A step smaller on phones, so the name fits beside the recipes link and the language button. */}
          <span className="truncate font-serif text-base font-semibold tracking-tight transition-colors group-hover:text-primary sm:text-lg">
            {SITE_NAME}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <nav>
            <Link
              href={localizePath("/#recipe-grid", locale)}
              className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {/* Icon only on phones, so the language button still fits beside the name. */}
              <span className="sr-only sm:not-sr-only">{t.recipes}</span>
            </Link>
          </nav>
          <LanguageSwitcher locale={locale} label={t.language} path={switcherPath} />
        </div>
      </div>
    </header>
  );
}
