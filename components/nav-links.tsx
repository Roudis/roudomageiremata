"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizePath, splitLocalePath, type Locale } from "@/lib/i18n/config";

type NavLinksProps = {
  locale: Locale;
  /** The two sections of the book, named in the page's language. */
  labels: { recipes: string; stories: string };
};

const sections = [
  { key: "recipes", path: "/recipes" },
  { key: "stories", path: "/stories" },
] as const;

/**
 * The navbar's links to the two halves of the site, recipes and stories. A client
 * component only so it can mark the section being read: a recipe page counts as
 * "recipes", a story page as "stories".
 */
export function NavLinks({ locale, labels }: NavLinksProps) {
  const { path: current } = splitLocalePath(usePathname());

  return (
    <ul className="flex items-center gap-1">
      {sections.map(({ key, path }) => {
        const active = current === path || current.startsWith(`${path}/`);
        return (
          <li key={key}>
            <Link
              href={localizePath(path, locale)}
              aria-current={active ? (current === path ? "page" : "true") : undefined}
              className={`inline-flex h-9 items-center rounded-full px-2.5 text-sm font-medium transition-colors focus-ring sm:px-3 ${
                active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {labels[key]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
