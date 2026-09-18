import { Heart } from "lucide-react";
import { SITE_NAME, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export function Footer({ locale }: { locale: Locale }) {
  const t = getMessages(locale).footer;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border">
      <div className="page-container flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-lg font-semibold">{SITE_NAME}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          &copy; {currentYear} · {t.madeWith}
          <Heart className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
          <span className="sr-only">{t.love}</span>
          {t.forFamily}
        </p>
      </div>
    </footer>
  );
}
