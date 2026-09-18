import type { Messages } from "./el";

// Ukrainian quotes are « ». Counts have three forms: 1 рецепт, 2–4 рецепти (`few`), and
// 0 or 5–20 рецептів, which Intl calls `many` and formatCount gives the `other` form.
export const uk: Messages = {
  site: {
    tagline: "Родинні рецепти",
    description:
      "Теплий, особистий путівник нашими улюбленими рецептами, маленькими секретами нашої кухні та історіями, що їх супроводжують.",
  },
  nav: {
    home: "Головна сторінка",
    recipes: "Рецепти",
    language: "Мова",
  },
  footer: {
    tagline: "Родинні рецепти та їхні історії.",
    madeWith: "Зроблено з",
    love: "любов’ю",
    forFamily: "для родини",
  },
  home: {
    eyebrow: "Родинний зошит рецептів",
    headline: "Деякі наші спогади сповнені смаків,",
    headlineEmphasis: "а деякі смаки сповнені наших спогадів.",
    intro: "Ρουδομαγειρέματα — це невелика збірка рецептів, які смакують домом або подорожами.",
    browse: "Погортай наші рецепти",
    quote:
      "Деякі рецепти починаються з краплі олії та трохи цибульки, але найкращі — з того, що хтось каже: «Пам’ятаєш, як тоді…?»",
    statRecipes: "Рецепти",
    statCategories: "Категорії",
    statStories: "Історії",
    gridTitle: "Рецепти нашої родини",
    gridIntro: "Кожен у родині має тут своє місце. Відкрий історії та страви, які роблять кожного з них особливим!",
  },
  recipeList: {
    searchPlaceholder: "Рецепт, інгредієнт або мітка…",
    searchLabel: "Пошук рецептів",
    clearSearch: "Очистити пошук",
    allCategories: "Усі",
    emptyTitle: "Рецептів не знайдено",
    emptyText: "Спробуй інші слова для пошуку або вибери іншу категорію.",
    resetFilters: "Скинути фільтри",
  },
  recipeCard: {
    hasStory: "З родинною історією",
  },
  recipe: {
    back: "Усі рецепти",
    untranslated: "Цей рецепт ще не перекладено українською, тому він показаний грецькою.",
    otherCategory: "Інше",
    prepTime: "Підготовка",
    cookTime: "Готування",
    servings: "Порції",
    updated: "Оновлено",
    story: "Історія рецепта",
    quoteOpen: "«",
    quoteClose: "»",
    ingredients: "Інгредієнти",
    ingredientsHint: "Познач усе, що вже готово.",
    steps: "Спосіб приготування",
  },
  tags: {
    label: "Мітки",
  },
  counts: {
    recipes: { one: "{count} рецепт", few: "{count} рецепти", other: "{count} рецептів" },
    found: { one: "Знайдено {count} рецепт", few: "Знайдено {count} рецепти", other: "Знайдено {count} рецептів" },
    servings: { one: "{count} порція", few: "{count} порції", other: "{count} порцій" },
    ingredients: { one: "{count} інгредієнт", few: "{count} інгредієнти", other: "{count} інгредієнтів" },
    steps: { one: "{count} крок", few: "{count} кроки", other: "{count} кроків" },
  },
};
