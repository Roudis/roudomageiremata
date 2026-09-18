import type { Messages } from "./el";

export const es: Messages = {
  site: {
    tagline: "Recetas de familia",
    description:
      "Una guía cálida y personal con nuestras recetas favoritas, los pequeños secretos de nuestra cocina y las historias que las acompañan.",
  },
  nav: {
    home: "Página de inicio",
    recipes: "Recetas",
    language: "Idioma",
  },
  footer: {
    tagline: "Recetas de familia y sus historias.",
    madeWith: "Hecho con",
    love: "amor",
    forFamily: "para la familia",
  },
  home: {
    eyebrow: "El cuaderno de recetas de la familia",
    headline: "Algunos de nuestros recuerdos están llenos de sabores,",
    headlineEmphasis: "y algunos sabores están llenos de nuestros recuerdos.",
    intro: "Ρουδομαγειρέματα es una pequeña colección de recetas que saben a hogar, o a nuestros viajes.",
    browse: "Hojea nuestras recetas",
    quote:
      "Algunas recetas empiezan con un chorrito de aceite y un poco de cebolla, pero las mejores empiezan cuando alguien dice «¿Te acuerdas de aquella vez que…?»",
    statRecipes: "Recetas",
    statCategories: "Categorías",
    statStories: "Historias",
    gridTitle: "Las recetas de la familia",
    gridIntro:
      "Cada miembro de la familia tiene aquí su propio lugar. ¡Descubre las historias y los platos que los hacen especiales!",
  },
  recipeList: {
    searchPlaceholder: "Busca una receta o un ingrediente…",
    searchLabel: "Buscar recetas",
    clearSearch: "Borrar la búsqueda",
    allCategories: "Todas",
    emptyTitle: "No se encontraron recetas",
    emptyText: "Prueba con otros términos de búsqueda o elige otra categoría.",
    resetFilters: "Borrar filtros",
  },
  recipeCard: {
    hasStory: "Con una historia familiar",
  },
  recipe: {
    back: "Todas las recetas",
    untranslated: "Esta receta aún no se ha traducido al español, así que se muestra en griego.",
    otherCategory: "Otras",
    prepTime: "Preparación",
    cookTime: "Cocción",
    servings: "Raciones",
    updated: "Actualizada",
    story: "La historia detrás de la receta",
    quoteOpen: "«",
    quoteClose: "»",
    ingredients: "Ingredientes",
    ingredientsHint: "Marca lo que ya tengas preparado.",
    steps: "Elaboración",
  },
  counts: {
    recipes: { one: "{count} receta", other: "{count} recetas" },
    found: { one: "Se encontró {count} receta", other: "Se encontraron {count} recetas" },
    servings: { one: "{count} ración", other: "{count} raciones" },
    ingredients: { one: "{count} ingrediente", other: "{count} ingredientes" },
    steps: { one: "{count} paso", other: "{count} pasos" },
  },
};
