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
    stories: "Історії",
    allRecipes: "Усі рецепти",
    allStories: "Усі історії",
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
    readStories: "Почитай наші історії",
    quote:
      "Деякі рецепти починаються з краплі олії та трохи цибульки, але найкращі — з того, що хтось каже: «Пам’ятаєш, як тоді…?»",
    statRecipes: "Рецепти",
    statCategories: "Розділи",
    statStories: "Історії",
    chaptersEyebrow: "Зміст",
    chaptersTitle: "Розділи нашого зошита",
    chaptersIntro: "Кожен у родині має тут своє місце. Відкрий історії та страви, які роблять кожного з них особливим!",
    latestEyebrow: "Найновіші рецепти",
    latestTitle: "Щойно з кухні",
  },
  recipesPage: {
    title: "Рецепти нашої родини",
    intro: "Шукай за назвою чи інгредієнтом або вибери розділ, який тебе вабить.",
  },
  recipeList: {
    searchPlaceholder: "Рецепт, інгредієнт або мітка…",
    searchLabel: "Пошук рецептів",
    clearSearch: "Очистити пошук",
    allCategories: "Усі",
    categoriesLabel: "Розділи",
    emptyTitle: "Рецептів не знайдено",
    emptyText: "Спробуй інші слова для пошуку або вибери інший розділ.",
    resetFilters: "Скинути фільтри",
  },
  recipeCard: {
    hasStory: "З родинною історією",
  },
  recipe: {
    untranslated: "Цей рецепт ще не перекладено українською, тому він показаний грецькою.",
    otherCategory: "Інше",
    prepTime: "Підготовка",
    cookTime: "Готування",
    servings: "Порції",
    updated: "Оновлено",
    story: "Історія рецепта",
    readStory: "Прочитай усю історію",
    mentionedIn: "Він згадується і в цих історіях",
    moreFrom: "З того самого розділу",
    ingredients: "Інгредієнти",
    ingredientsHint: "Познач усе, що вже готово.",
    steps: "Спосіб приготування",
  },
  stories: {
    eyebrow: "Щоденник",
    title: "Історії з-за нашого столу",
    intro:
      "Кожен рецепт несе із собою спогад. Ми зберігаємо їх тут усі разом, щоб пам’ятати, хто готував, коли і чому ми сміялися.",
    read: "Прочитай історію",
    label: "Родинна історія",
    recipeLabel: "Рецепт",
    recipe: "Рецепт із цієї історії",
    viewRecipe: "Перейди до рецепта",
    alsoMentioned: "В історії також згадуються",
    previous: "Попередня історія",
    next: "Наступна історія",
    untranslated: "Цю історію ще не перекладено українською, тому вона показана грецькою.",
  },
  tags: {
    label: "Мітки",
  },
  counts: {
    recipes: { one: "{count} рецепт", few: "{count} рецепти", other: "{count} рецептів" },
    stories: { one: "{count} історія", few: "{count} історії", other: "{count} історій" },
    found: { one: "Знайдено {count} рецепт", few: "Знайдено {count} рецепти", other: "Знайдено {count} рецептів" },
    servings: { one: "{count} порція", few: "{count} порції", other: "{count} порцій" },
    ingredients: { one: "{count} інгредієнт", few: "{count} інгредієнти", other: "{count} інгредієнтів" },
    steps: { one: "{count} крок", few: "{count} кроки", other: "{count} кроків" },
  },
};
