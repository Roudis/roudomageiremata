"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Languages } from "lucide-react";
import { LOCALES, LOCALE_DETAILS, localizePath, splitLocalePath, type Locale } from "@/lib/i18n/config";
import { withBasePath } from "@/lib/base-path";

type LanguageSwitcherProps = {
  locale: Locale;
  /** "Language" in the page's language: the button's label and the list's heading. */
  label: string;
  /** The Greek path to link to in each language; defaults to the page being viewed. */
  path?: string;
};

/**
 * The navbar's language menu. Each entry links to the page being viewed in that
 * language, so switching keeps you on the same recipe. A disclosure button and a
 * list of links rather than an ARIA menu: Tab moves through the languages, and
 * Escape or a click elsewhere closes it.
 */
export function LanguageSwitcher({ locale, label, path }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const pathname = usePathname();
  const greekPath = path ?? splitLocalePath(pathname).path;

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        // Close once keyboard focus has left both the button and the list.
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Languages className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="sr-only">{label}: </span>
        {/* The language's name on wider screens, its code on phones. */}
        <span className="sr-only sm:not-sr-only">{LOCALE_DETAILS[locale].name}</span>
        <span aria-hidden="true" className="font-semibold uppercase sm:hidden">
          {locale}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Always rendered so it can fade; `invisible` keeps the closed list out of the tab order. */}
      <div
        id={listId}
        className={`absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-lg transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <p className="px-3 pb-1 pt-1.5 text-xs font-semibold text-muted-foreground">{label}</p>
        <ul>
          {LOCALES.map((code) => {
            const isCurrent = code === locale;
            return (
              <li key={code}>
                {/*
                  A plain link, so switching is a full page load: each language renders its own
                  <html lang>, which a client-side navigation would have to swap in place.
                */}
                <a
                  href={withBasePath(localizePath(greekPath, code))}
                  hrefLang={code}
                  lang={code}
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isCurrent ? "bg-primary-soft font-semibold text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {LOCALE_DETAILS[code].name}
                  {isCurrent ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true" className="text-xs font-medium uppercase text-muted-foreground">
                      {code}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
