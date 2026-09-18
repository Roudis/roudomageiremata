import type { Messages } from "./el";

export const sv: Messages = {
  site: {
    tagline: "Familjerecept",
    description:
      "En varm, personlig guide till våra favoritrecept, de små hemligheterna i vårt kök och berättelserna som hör till dem.",
  },
  nav: {
    home: "Startsida",
    recipes: "Recept",
    language: "Språk",
  },
  footer: {
    tagline: "Familjerecept och deras berättelser.",
    madeWith: "Gjord med",
    love: "kärlek",
    forFamily: "för familjen",
  },
  home: {
    eyebrow: "Familjens receptbok",
    headline: "Vissa av våra minnen är fulla av smaker,",
    headlineEmphasis: "och vissa smaker är fulla av våra minnen.",
    intro: "Ρουδομαγειρέματα är en liten samling recept som smakar av hemmet, eller av våra resor.",
    browse: "Bläddra bland våra recept",
    quote:
      "Vissa recept börjar med en skvätt olja och lite lök, men de bästa börjar med att någon säger ”Minns du när…?”",
    statRecipes: "Recept",
    statCategories: "Kategorier",
    statStories: "Berättelser",
    gridTitle: "Familjens recept",
    gridIntro:
      "Alla i familjen har sin egen plats här. Upptäck berättelserna och rätterna som gör var och en av dem speciell!",
  },
  recipeList: {
    searchPlaceholder: "Recept, ingrediens eller tagg…",
    searchLabel: "Sök recept",
    clearSearch: "Rensa sökningen",
    allCategories: "Alla",
    emptyTitle: "Inga recept hittades",
    emptyText: "Prova andra sökord eller välj en annan kategori.",
    resetFilters: "Rensa filter",
  },
  recipeCard: {
    hasStory: "Med en familjeberättelse",
  },
  recipe: {
    back: "Alla recept",
    untranslated: "Det här receptet har inte översatts till svenska än, så det visas på grekiska.",
    otherCategory: "Övrigt",
    prepTime: "Förberedelse",
    cookTime: "Tillagning",
    servings: "Portioner",
    updated: "Uppdaterad",
    story: "Berättelsen bakom receptet",
    quoteOpen: "”",
    quoteClose: "”",
    ingredients: "Ingredienser",
    ingredientsHint: "Bocka av det du redan har förberett.",
    steps: "Gör så här",
  },
  tags: {
    label: "Taggar",
  },
  counts: {
    recipes: { one: "{count} recept", other: "{count} recept" },
    found: { one: "{count} recept hittades", other: "{count} recept hittades" },
    servings: { one: "{count} portion", other: "{count} portioner" },
    ingredients: { one: "{count} ingrediens", other: "{count} ingredienser" },
    steps: { one: "{count} steg", other: "{count} steg" },
  },
};
