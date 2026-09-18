import type { Messages } from "./el";

// Romanian quotes are „ ”. Counts of 20 or more take "de" ("20 de rețete"), which is the `other` form.
export const ro: Messages = {
  site: {
    tagline: "Rețete de familie",
    description:
      "Un ghid cald și personal cu rețetele noastre preferate, micile secrete ale bucătăriei noastre și poveștile care le însoțesc.",
  },
  nav: {
    home: "Pagina principală",
    recipes: "Rețete",
    language: "Limba",
  },
  footer: {
    tagline: "Rețete de familie și poveștile lor.",
    madeWith: "Făcut cu",
    love: "dragoste",
    forFamily: "pentru familie",
  },
  home: {
    eyebrow: "Caietul de rețete al familiei",
    headline: "Unele dintre amintirile noastre sunt pline de gusturi,",
    headlineEmphasis: "iar unele gusturi sunt pline de amintirile noastre.",
    intro: "Ρουδομαγειρέματα este o mică colecție de rețete cu gust de acasă sau de călătorii.",
    browse: "Răsfoiește rețetele noastre",
    quote:
      "Unele rețete încep cu un strop de ulei și un pic de ceapă, dar cele mai bune încep cu cineva care spune „Îți amintești când…?”",
    statRecipes: "Rețete",
    statCategories: "Categorii",
    statStories: "Povești",
    gridTitle: "Rețetele familiei",
    gridIntro:
      "Fiecare membru al familiei are locul lui aici. Descoperă poveștile și mâncărurile care îi fac pe fiecare speciali!",
  },
  recipeList: {
    searchPlaceholder: "Rețetă, ingredient sau etichetă…",
    searchLabel: "Caută rețete",
    clearSearch: "Șterge căutarea",
    allCategories: "Toate",
    emptyTitle: "Nu s-au găsit rețete",
    emptyText: "Încearcă alți termeni de căutare sau alege altă categorie.",
    resetFilters: "Șterge filtrele",
  },
  recipeCard: {
    hasStory: "Cu o poveste de familie",
  },
  recipe: {
    back: "Toate rețetele",
    untranslated: "Această rețetă nu a fost încă tradusă în română, așa că este afișată în greacă.",
    otherCategory: "Altele",
    prepTime: "Pregătire",
    cookTime: "Gătire",
    servings: "Porții",
    updated: "Actualizat",
    story: "Povestea din spatele rețetei",
    quoteOpen: "„",
    quoteClose: "”",
    ingredients: "Ingrediente",
    ingredientsHint: "Bifează ce ai pregătit deja.",
    steps: "Mod de preparare",
  },
  tags: {
    label: "Etichete",
  },
  counts: {
    recipes: { one: "{count} rețetă", few: "{count} rețete", other: "{count} de rețete" },
    found: { one: "{count} rețetă găsită", few: "{count} rețete găsite", other: "{count} de rețete găsite" },
    servings: { one: "{count} porție", few: "{count} porții", other: "{count} de porții" },
    ingredients: { one: "{count} ingredient", few: "{count} ingrediente", other: "{count} de ingrediente" },
    steps: { one: "{count} pas", few: "{count} pași", other: "{count} de pași" },
  },
};
