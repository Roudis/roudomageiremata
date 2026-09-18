import type { Messages } from "./el";

// Japanese quotes are 「 」. Nouns have no plural, so each count's two forms are the same.
// The footer reads 家族のために ♥ を込めて作りました, with the heart standing for 愛.
export const ja: Messages = {
  site: {
    tagline: "家族のレシピ",
    description:
      "私たちのお気に入りのレシピ、台所のちょっとした秘密、そしてそれにまつわる物語を集めた、温かくて個人的なガイドです。",
  },
  nav: {
    home: "ホーム",
    recipes: "レシピ",
    language: "言語",
  },
  footer: {
    tagline: "家族のレシピと、その物語。",
    madeWith: "家族のために",
    love: "愛",
    forFamily: "を込めて作りました",
  },
  home: {
    eyebrow: "家族のレシピノート",
    headline: "私たちの思い出には、味わいに満ちたものがあり、",
    headlineEmphasis: "味わいには、私たちの思い出に満ちたものがあります。",
    intro: "Ρουδομαγειρέματα は、家庭の味や旅の味がする、小さなレシピ集です。",
    browse: "レシピを見てみる",
    quote:
      "オリーブオイルと玉ねぎで始まるレシピもありますが、いちばんのレシピは、誰かの「覚えてる？あのとき…」という一言から始まります。",
    statRecipes: "レシピ",
    statCategories: "カテゴリー",
    statStories: "物語",
    gridTitle: "家族のレシピ",
    gridIntro: "家族の一人ひとりに、ここでの居場所があります。それぞれを特別にしている物語と料理を見つけてください！",
  },
  recipeList: {
    searchPlaceholder: "レシピ、材料、タグ…",
    searchLabel: "レシピを検索",
    clearSearch: "検索をクリア",
    allCategories: "すべて",
    emptyTitle: "レシピが見つかりません",
    emptyText: "別のキーワードで検索するか、別のカテゴリーを選んでください。",
    resetFilters: "フィルターをクリア",
  },
  recipeCard: {
    hasStory: "家族の物語つき",
  },
  recipe: {
    back: "すべてのレシピ",
    untranslated: "このレシピはまだ日本語に翻訳されていないため、ギリシャ語で表示しています。",
    otherCategory: "その他",
    prepTime: "下ごしらえ",
    cookTime: "調理",
    servings: "分量",
    updated: "更新日",
    story: "レシピにまつわる物語",
    quoteOpen: "「",
    quoteClose: "」",
    ingredients: "材料",
    ingredientsHint: "準備ができたものにチェックを入れましょう。",
    steps: "作り方",
  },
  tags: {
    label: "タグ",
  },
  counts: {
    recipes: { one: "{count}件のレシピ", other: "{count}件のレシピ" },
    found: { one: "{count}件のレシピが見つかりました", other: "{count}件のレシピが見つかりました" },
    servings: { one: "{count}人分", other: "{count}人分" },
    ingredients: { one: "材料{count}種類", other: "材料{count}種類" },
    steps: { one: "{count}ステップ", other: "{count}ステップ" },
  },
};
