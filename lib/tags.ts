import type { Locale } from "@/lib/i18n/config";

/**
 * The tags a recipe can carry, in the order the filter shows them: diet, then
 * the main ingredient, then the kind of dish. A recipe's `tags` may only use
 * these ids, which `npm run validate:data` checks. Adding a tag means adding
 * its name in every language here; a missing one fails `npm run typecheck`.
 * Pure, so it is safe on either side.
 */
export const TAG_NAMES = {
  vegan: {
    el: "Βίγκαν",
    en: "Vegan",
    nl: "Veganistisch",
    fr: "Végan",
    sv: "Vegansk",
    es: "Vegano",
    it: "Vegano",
    ro: "Vegan",
    cs: "Veganské",
    uk: "Веганське",
    ja: "ヴィーガン",
  },
  vegetarian: {
    el: "Χορτοφαγικό",
    en: "Vegetarian",
    nl: "Vegetarisch",
    fr: "Végétarien",
    sv: "Vegetarisk",
    es: "Vegetariano",
    it: "Vegetariano",
    ro: "Vegetarian",
    cs: "Vegetariánské",
    uk: "Вегетаріанське",
    ja: "ベジタリアン",
  },
  meat: {
    el: "Κρέας",
    en: "Meat",
    nl: "Vlees",
    fr: "Viande",
    sv: "Kött",
    es: "Carne",
    it: "Carne",
    ro: "Carne",
    cs: "Maso",
    uk: "М’ясо",
    ja: "肉",
  },
  beef: {
    el: "Μοσχάρι",
    en: "Beef",
    nl: "Rundvlees",
    fr: "Bœuf",
    sv: "Nötkött",
    es: "Ternera",
    it: "Manzo",
    ro: "Vită",
    cs: "Hovězí",
    uk: "Яловичина",
    ja: "牛肉",
  },
  pork: {
    el: "Χοιρινό",
    en: "Pork",
    nl: "Varkensvlees",
    fr: "Porc",
    sv: "Fläsk",
    es: "Cerdo",
    it: "Maiale",
    ro: "Porc",
    cs: "Vepřové",
    uk: "Свинина",
    ja: "豚肉",
  },
  lamb: {
    el: "Αρνί",
    en: "Lamb",
    nl: "Lamsvlees",
    fr: "Agneau",
    sv: "Lamm",
    es: "Cordero",
    it: "Agnello",
    ro: "Miel",
    cs: "Jehněčí",
    uk: "Ягнятина",
    ja: "ラム肉",
  },
  chicken: {
    el: "Κοτόπουλο",
    en: "Chicken",
    nl: "Kip",
    fr: "Poulet",
    sv: "Kyckling",
    es: "Pollo",
    it: "Pollo",
    ro: "Pui",
    cs: "Kuřecí",
    uk: "Курятина",
    ja: "鶏肉",
  },
  fish: {
    el: "Ψάρι",
    en: "Fish",
    nl: "Vis",
    fr: "Poisson",
    sv: "Fisk",
    es: "Pescado",
    it: "Pesce",
    ro: "Pește",
    cs: "Ryby",
    uk: "Риба",
    ja: "魚",
  },
  seafood: {
    el: "Θαλασσινά",
    en: "Seafood",
    nl: "Zeevruchten",
    fr: "Fruits de mer",
    sv: "Skaldjur",
    es: "Marisco",
    it: "Frutti di mare",
    ro: "Fructe de mare",
    cs: "Plody moře",
    uk: "Морепродукти",
    ja: "シーフード",
  },
  pasta: {
    el: "Ζυμαρικά",
    en: "Pasta",
    nl: "Pasta",
    fr: "Pâtes",
    sv: "Pasta",
    es: "Pasta",
    it: "Pasta",
    ro: "Paste",
    cs: "Těstoviny",
    uk: "Паста",
    ja: "パスタ",
  },
  pie: {
    el: "Πίτα",
    en: "Pie",
    nl: "Hartige taart",
    fr: "Tourte",
    sv: "Paj",
    es: "Pastel salado",
    it: "Torta salata",
    ro: "Plăcintă",
    cs: "Slaný koláč",
    uk: "Пиріг",
    ja: "パイ",
  },
  soup: {
    el: "Σούπα",
    en: "Soup",
    nl: "Soep",
    fr: "Soupe",
    sv: "Soppa",
    es: "Sopa",
    it: "Zuppa",
    ro: "Supă",
    cs: "Polévka",
    uk: "Суп",
    ja: "スープ",
  },
  meze: {
    el: "Μεζέδες",
    en: "Meze",
    nl: "Meze",
    fr: "Mezzés",
    sv: "Meze",
    es: "Meze",
    it: "Meze",
    ro: "Meze",
    cs: "Meze",
    uk: "Мезе",
    ja: "メゼ",
  },
  dessert: {
    el: "Γλυκό",
    en: "Dessert",
    nl: "Dessert",
    fr: "Dessert",
    sv: "Efterrätt",
    es: "Postre",
    it: "Dolce",
    ro: "Desert",
    cs: "Dezert",
    uk: "Десерт",
    ja: "デザート",
  },
  drink: {
    el: "Ποτό",
    en: "Drink",
    nl: "Drankje",
    fr: "Boisson",
    sv: "Dryck",
    es: "Bebida",
    it: "Bevanda",
    ro: "Băutură",
    cs: "Nápoj",
    uk: "Напій",
    ja: "飲み物",
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type TagId = keyof typeof TAG_NAMES;

export const TAG_IDS = Object.keys(TAG_NAMES) as TagId[];

/**
 * Broader tags a tag counts as, so a recipe lists only the most specific one:
 * a vegan recipe turns up under "vegetarian" and a beef one under "meat".
 * One level deep; listing an implied tag as well is a data error.
 */
export const TAG_IMPLIES: Partial<Record<TagId, readonly TagId[]>> = {
  vegan: ["vegetarian"],
  beef: ["meat"],
  pork: ["meat"],
  lamb: ["meat"],
  chicken: ["meat"],
};

/** Tags that cannot apply to a vegetarian recipe. */
export const NOT_VEGETARIAN: readonly TagId[] = ["meat", "fish", "seafood"];

export function isTagId(value: unknown): value is TagId {
  return typeof value === "string" && Object.hasOwn(TAG_NAMES, value);
}

export function tagName(tag: TagId, locale: Locale): string {
  return TAG_NAMES[tag][locale];
}

/** The tags plus every tag they imply, without duplicates, in TAG_IDS order. */
export function expandTags(tags: readonly TagId[]): TagId[] {
  const expanded = new Set<TagId>();
  for (const tag of tags) {
    expanded.add(tag);
    for (const implied of TAG_IMPLIES[tag] ?? []) expanded.add(implied);
  }
  return TAG_IDS.filter((tag) => expanded.has(tag));
}
