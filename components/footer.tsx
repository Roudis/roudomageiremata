import Link from "next/link";
import { Heart } from "lucide-react";
import { SITE_NAME, localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export function Footer({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);
  const t = messages.footer;
  const currentYear = new Date().getFullYear();
  const links = [
    { href: "/recipes", label: messages.nav.recipes },
    { href: "/stories", label: messages.nav.stories },
  ];

  return (
    <footer className="mt-24 border-t border-border print:hidden">
      <div className="page-container py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-lg font-semibold">{SITE_NAME}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
          </div>
          <ul className="-mx-2 flex gap-2">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={localizePath(href, locale)}
                  className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-ring"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-8 flex items-center gap-1.5 border-t border-border pt-6 text-sm text-muted-foreground">
          &copy; {currentYear} · {t.madeWith}
          <Heart className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
          <span className="sr-only">{t.love}</span>
          {t.forFamily}
        </p>
      </div>
    </footer>
  );
}
