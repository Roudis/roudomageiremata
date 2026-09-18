import type { Messages } from "./el";

// French puts a no-break space ( ) inside « » and before ? and !.
export const fr: Messages = {
  site: {
    tagline: "Recettes de famille",
    description:
      "Un guide chaleureux et personnel de nos recettes préférées, des petits secrets de notre cuisine et des histoires qui les accompagnent.",
  },
  nav: {
    home: "Page d’accueil",
    recipes: "Recettes",
    language: "Langue",
  },
  footer: {
    tagline: "Des recettes de famille et leurs histoires.",
    madeWith: "Fait avec",
    love: "amour",
    forFamily: "pour la famille",
  },
  home: {
    eyebrow: "Le carnet de recettes de la famille",
    headline: "Certains de nos souvenirs sont pleins de saveurs,",
    headlineEmphasis: "et certaines saveurs sont pleines de nos souvenirs.",
    intro: "Ρουδομαγειρέματα est une petite collection de recettes qui ont le goût de la maison, ou celui des voyages.",
    browse: "Feuillette nos recettes",
    quote:
      "Certaines recettes commencent par un filet d’huile et un peu d’oignon, mais les meilleures commencent quand quelqu’un dit « Tu te souviens de la fois où… ? »",
    statRecipes: "Recettes",
    statCategories: "Catégories",
    statStories: "Histoires",
    gridTitle: "Les recettes de la famille",
    gridIntro:
      "Chaque membre de la famille a sa place ici. Découvre les histoires et les petits plats qui les rendent uniques !",
  },
  recipeList: {
    searchPlaceholder: "Recette, ingrédient ou étiquette…",
    searchLabel: "Rechercher une recette",
    clearSearch: "Effacer la recherche",
    allCategories: "Toutes",
    emptyTitle: "Aucune recette trouvée",
    emptyText: "Essaie d’autres mots-clés ou choisis une autre catégorie.",
    resetFilters: "Réinitialiser les filtres",
  },
  recipeCard: {
    hasStory: "Avec une histoire de famille",
  },
  recipe: {
    back: "Toutes les recettes",
    untranslated: "Cette recette n’a pas encore été traduite en français, elle est donc affichée en grec.",
    otherCategory: "Autre",
    prepTime: "Préparation",
    cookTime: "Cuisson",
    servings: "Parts",
    updated: "Mise à jour",
    story: "L’histoire derrière la recette",
    quoteOpen: "« ",
    quoteClose: " »",
    ingredients: "Ingrédients",
    ingredientsHint: "Coche ce que tu as déjà préparé.",
    steps: "Réalisation",
  },
  tags: {
    label: "Étiquettes",
  },
  counts: {
    recipes: { one: "{count} recette", other: "{count} recettes" },
    found: { one: "{count} recette trouvée", other: "{count} recettes trouvées" },
    servings: { one: "{count} part", other: "{count} parts" },
    ingredients: { one: "{count} ingrédient", other: "{count} ingrédients" },
    steps: { one: "{count} étape", other: "{count} étapes" },
  },
};
