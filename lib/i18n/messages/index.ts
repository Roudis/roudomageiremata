import type { Locale } from "@/lib/i18n/config";
import { el, type Messages } from "./el";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { nl } from "./nl";
import { sv } from "./sv";
import { ro } from "./ro";
import { cs } from "./cs";
import { uk } from "./uk";
import { ja } from "./ja";

export type { Messages };

const MESSAGES: Record<Locale, Messages> = { el, en, nl, fr, sv, es, it, ro, cs, uk, ja };

/**
 * The interface text for one language. Server code calls this; client
 * components get only the section they render, as a prop.
 */
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
