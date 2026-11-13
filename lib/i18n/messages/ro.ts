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
    stories: "Povești",
    allRecipes: "Toate rețetele",
    allStories: "Toate poveștile",
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
    readStories: "Citește poveștile noastre",
    quote:
      "Unele rețete încep cu un strop de ulei și un pic de ceapă, dar cele mai bune încep cu cineva care spune „Îți amintești când…?”",
    statRecipes: "Rețete",
    statCategories: "Capitole",
    statStories: "Povești",
    chaptersEyebrow: "Cuprins",
    chaptersTitle: "Capitolele caietului",
    chaptersIntro:
      "Fiecare membru al familiei are locul lui aici. Descoperă poveștile și mâncărurile care îi fac pe fiecare speciali!",
    latestEyebrow: "Cele mai noi rețete",
    latestTitle: "Proaspete din bucătărie",
  },
  recipesPage: {
    title: "Rețetele familiei",
    intro: "Caută după nume sau după ingredient, ori alege capitolul care te tentează.",
  },
  recipeList: {
    searchPlaceholder: "Rețetă, ingredient sau etichetă…",
    searchLabel: "Caută rețete",
    clearSearch: "Șterge căutarea",
    allCategories: "Toate",
    categoriesLabel: "Capitole",
    emptyTitle: "Nu s-au găsit rețete",
    emptyText: "Încearcă alți termeni de căutare sau alege alt capitol.",
    resetFilters: "Șterge filtrele",
  },
  recipeCard: {
    hasStory: "Cu o poveste de familie",
  },
  recipe: {
    untranslated: "Această rețetă nu a fost încă tradusă în română, așa că este afișată în greacă.",
    otherCategory: "Altele",
    prepTime: "Pregătire",
    cookTime: "Gătire",
    servings: "Porții",
    updated: "Actualizat",
    story: "Povestea din spatele rețetei",
    readStory: "Citește toată povestea",
    mentionedIn: "O găsești și în aceste povești",
    moreFrom: "Din același capitol",
    ingredients: "Ingrediente",
    ingredientsHint: "Bifează ce ai pregătit deja.",
    steps: "Mod de preparare",
  },
  stories: {
    eyebrow: "Jurnalul",
    title: "Povești de la masa noastră",
    intro:
      "Fiecare rețetă poartă cu ea o amintire. Le păstrăm aici pe toate, ca să ne amintim cine gătea, când și de ce râdeam.",
    read: "Citește povestea",
    label: "Poveste de familie",
    recipeLabel: "Rețetă",
    recipe: "Rețeta din această poveste",
    viewRecipe: "Vezi rețeta",
    alsoMentioned: "În poveste mai apar",
    previous: "Povestea anterioară",
    next: "Povestea următoare",
    untranslated: "Această poveste nu a fost încă tradusă în română, așa că este afișată în greacă.",
  },
  tags: {
    label: "Etichete",
  },
  counts: {
    recipes: { one: "{count} rețetă", few: "{count} rețete", other: "{count} de rețete" },
    stories: { one: "{count} poveste", few: "{count} povești", other: "{count} de povești" },
    found: { one: "{count} rețetă găsită", few: "{count} rețete găsite", other: "{count} de rețete găsite" },
    servings: { one: "{count} porție", few: "{count} porții", other: "{count} de porții" },
    ingredients: { one: "{count} ingredient", few: "{count} ingrediente", other: "{count} de ingrediente" },
    steps: { one: "{count} pas", few: "{count} pași", other: "{count} de pași" },
  },
};
