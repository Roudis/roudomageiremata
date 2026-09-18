import type { Messages } from "./el";

export const it: Messages = {
  site: {
    tagline: "Ricette di famiglia",
    description:
      "Una guida calda e personale alle nostre ricette preferite, ai piccoli segreti della nostra cucina e alle storie che le accompagnano.",
  },
  nav: {
    home: "Pagina iniziale",
    recipes: "Ricette",
    language: "Lingua",
  },
  footer: {
    tagline: "Ricette di famiglia e le loro storie.",
    madeWith: "Fatto con",
    love: "amore",
    forFamily: "per la famiglia",
  },
  home: {
    eyebrow: "Il quaderno di ricette di famiglia",
    headline: "Alcuni dei nostri ricordi sono pieni di sapori,",
    headlineEmphasis: "e alcuni sapori sono pieni dei nostri ricordi.",
    intro: "Ρουδομαγειρέματα è una piccola raccolta di ricette che sanno di casa, o dei nostri viaggi.",
    browse: "Sfoglia le nostre ricette",
    quote:
      "Alcune ricette iniziano con un filo d’olio e un po’ di cipolla, ma le migliori iniziano con qualcuno che dice «Ti ricordi quella volta che…?»",
    statRecipes: "Ricette",
    statCategories: "Categorie",
    statStories: "Storie",
    gridTitle: "Le ricette della famiglia",
    gridIntro:
      "Ogni membro della famiglia ha qui il suo posto. Scopri le storie e i piatti che li rendono speciali!",
  },
  recipeList: {
    searchPlaceholder: "Ricetta, ingrediente o etichetta…",
    searchLabel: "Cerca ricette",
    clearSearch: "Cancella la ricerca",
    allCategories: "Tutte",
    emptyTitle: "Nessuna ricetta trovata",
    emptyText: "Prova a cambiare i termini di ricerca o scegli un’altra categoria.",
    resetFilters: "Cancella i filtri",
  },
  recipeCard: {
    hasStory: "Con una storia di famiglia",
  },
  recipe: {
    back: "Tutte le ricette",
    untranslated: "Questa ricetta non è ancora stata tradotta in italiano, quindi è mostrata in greco.",
    otherCategory: "Altro",
    prepTime: "Preparazione",
    cookTime: "Cottura",
    servings: "Porzioni",
    updated: "Aggiornata",
    story: "La storia dietro la ricetta",
    quoteOpen: "«",
    quoteClose: "»",
    ingredients: "Ingredienti",
    ingredientsHint: "Spunta ciò che hai già preparato.",
    steps: "Procedimento",
  },
  tags: {
    label: "Etichette",
  },
  counts: {
    recipes: { one: "{count} ricetta", other: "{count} ricette" },
    found: { one: "{count} ricetta trovata", other: "{count} ricette trovate" },
    servings: { one: "{count} porzione", other: "{count} porzioni" },
    ingredients: { one: "{count} ingrediente", other: "{count} ingredienti" },
    steps: { one: "{count} passaggio", other: "{count} passaggi" },
  },
};
