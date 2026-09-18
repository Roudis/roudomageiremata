import type { Messages } from "./el";

// Czech quotes are „ “. Counts have three forms: 1 recept, 2–4 recepty (`few`), 5 or more receptů.
export const cs: Messages = {
  site: {
    tagline: "Rodinné recepty",
    description:
      "Vřelý, osobní průvodce našimi oblíbenými recepty, malými tajemstvími naší kuchyně a příběhy, které k nim patří.",
  },
  nav: {
    home: "Úvodní stránka",
    recipes: "Recepty",
    language: "Jazyk",
  },
  footer: {
    tagline: "Rodinné recepty a jejich příběhy.",
    madeWith: "Vytvořeno s",
    love: "láskou",
    forFamily: "pro rodinu",
  },
  home: {
    eyebrow: "Rodinný sešit receptů",
    headline: "Některé naše vzpomínky jsou plné chutí",
    headlineEmphasis: "a některé chutě jsou plné našich vzpomínek.",
    intro: "Ρουδομαγειρέματα jsou malá sbírka receptů, které chutnají po domově nebo po cestách.",
    browse: "Prolistuj naše recepty",
    quote:
      "Některé recepty začínají kapkou oleje a trochou cibulky, ale ty nejlepší začínají tím, že někdo řekne „Pamatuješ, jak…?“",
    statRecipes: "Recepty",
    statCategories: "Kategorie",
    statStories: "Příběhy",
    gridTitle: "Recepty naší rodiny",
    gridIntro: "Každý v rodině tu má své místo. Objev příběhy a jídla, díky kterým je každý z nich výjimečný!",
  },
  recipeList: {
    searchPlaceholder: "Recept, surovina nebo štítek…",
    searchLabel: "Hledat recepty",
    clearSearch: "Vymazat hledání",
    allCategories: "Vše",
    emptyTitle: "Žádné recepty nenalezeny",
    emptyText: "Zkus jiné hledané výrazy nebo vyber jinou kategorii.",
    resetFilters: "Zrušit filtry",
  },
  recipeCard: {
    hasStory: "S rodinným příběhem",
  },
  recipe: {
    back: "Všechny recepty",
    untranslated: "Tento recept zatím nebyl přeložen do češtiny, proto se zobrazuje v řečtině.",
    otherCategory: "Ostatní",
    prepTime: "Příprava",
    cookTime: "Vaření",
    servings: "Porce",
    updated: "Aktualizováno",
    story: "Příběh za receptem",
    quoteOpen: "„",
    quoteClose: "“",
    ingredients: "Suroviny",
    ingredientsHint: "Odškrtni si, co už máš připravené.",
    steps: "Postup",
  },
  tags: {
    label: "Štítky",
  },
  counts: {
    recipes: { one: "{count} recept", few: "{count} recepty", other: "{count} receptů" },
    found: { one: "Nalezen {count} recept", few: "Nalezeny {count} recepty", other: "Nalezeno {count} receptů" },
    servings: { one: "{count} porce", few: "{count} porce", other: "{count} porcí" },
    ingredients: { one: "{count} surovina", few: "{count} suroviny", other: "{count} surovin" },
    steps: { one: "{count} krok", few: "{count} kroky", other: "{count} kroků" },
  },
};
