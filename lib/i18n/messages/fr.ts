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
    stories: "Histoires",
    allRecipes: "Toutes les recettes",
    allStories: "Toutes les histoires",
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
    readStories: "Lis nos histoires",
    quote:
      "Certaines recettes commencent par un filet d’huile et un peu d’oignon, mais les meilleures commencent quand quelqu’un dit « Tu te souviens de la fois où… ? »",
    statRecipes: "Recettes",
    statCategories: "Chapitres",
    statStories: "Histoires",
    chaptersEyebrow: "Sommaire",
    chaptersTitle: "Les chapitres du carnet",
    chaptersIntro:
      "Chaque membre de la famille a sa place ici. Découvre les histoires et les petits plats qui les rendent uniques !",
    latestEyebrow: "Dernières recettes",
    latestTitle: "Tout juste sorties de la cuisine",
  },
  recipesPage: {
    title: "Les recettes de la famille",
    intro: "Cherche par nom ou par ingrédient, ou choisis le chapitre qui te tente.",
  },
  recipeList: {
    searchPlaceholder: "Recette, ingrédient ou étiquette…",
    searchLabel: "Rechercher une recette",
    clearSearch: "Effacer la recherche",
    allCategories: "Toutes",
    categoriesLabel: "Chapitres",
    emptyTitle: "Aucune recette trouvée",
    emptyText: "Essaie d’autres mots-clés ou choisis un autre chapitre.",
    resetFilters: "Réinitialiser les filtres",
  },
  recipeCard: {
    hasStory: "Avec une histoire de famille",
  },
  recipe: {
    untranslated: "Cette recette n’a pas encore été traduite en français, elle est donc affichée en grec.",
    otherCategory: "Autre",
    prepTime: "Préparation",
    cookTime: "Cuisson",
    servings: "Parts",
    updated: "Mise à jour",
    story: "L’histoire derrière la recette",
    readStory: "Lis toute l’histoire",
    mentionedIn: "On la retrouve aussi dans ces histoires",
    moreFrom: "Dans le même chapitre",
    ingredients: "Ingrédients",
    ingredientsHint: "Coche ce que tu as déjà préparé.",
    steps: "Réalisation",
  },
  stories: {
    eyebrow: "Le journal",
    title: "Histoires de notre table",
    intro:
      "Chaque recette porte un souvenir. Nous les gardons tous ici, pour nous rappeler qui cuisinait, quand, et pourquoi nous riions.",
    read: "Lis l’histoire",
    label: "Histoire de famille",
    recipeLabel: "Recette",
    recipe: "La recette de cette histoire",
    viewRecipe: "Découvre la recette",
    alsoMentioned: "Également mentionnées dans cette histoire",
    previous: "Histoire précédente",
    next: "Histoire suivante",
    untranslated: "Cette histoire n’a pas encore été traduite en français, elle est donc affichée en grec.",
  },
  tags: {
    label: "Étiquettes",
  },
  counts: {
    recipes: { one: "{count} recette", other: "{count} recettes" },
    stories: { one: "{count} histoire", other: "{count} histoires" },
    found: { one: "{count} recette trouvée", other: "{count} recettes trouvées" },
    servings: { one: "{count} part", other: "{count} parts" },
    ingredients: { one: "{count} ingrédient", other: "{count} ingrédients" },
    steps: { one: "{count} étape", other: "{count} étapes" },
  },
};
