import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NavLinks } from "@/components/nav-links";
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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md print:hidden">
      <div className="page-container flex h-16 items-center justify-between gap-3">
        <Link
          href={localizePath("/", locale)}
          className="group flex min-w-0 items-center gap-3 rounded-md focus-ring-offset focus-visible:ring-offset-4"
          aria-label={t.home}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary font-serif text-lg font-semibold text-primary-foreground"
          >
            Ρ
          </span>
          {/* Phones show the monogram alone, so both section links fit beside it as words. */}
          <span className="hidden truncate font-serif text-lg font-semibold tracking-tight transition-colors group-hover:text-primary sm:block">
            {SITE_NAME}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <nav>
            <NavLinks locale={locale} labels={{ recipes: t.recipes, stories: t.stories }} />
          </nav>
          <LanguageSwitcher locale={locale} label={t.language} path={switcherPath} />
        </div>
      </div>
    </header>
  );
}
