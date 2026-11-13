import type { PluralForms } from "@/lib/i18n/format";

/**
 * The Greek interface text, which every other language file must match key for
 * key: `Messages` is this object's type, so a missing or extra key fails
 * `npm run typecheck`. `{count}` is replaced by `formatCount` in lib/i18n/format.ts,
 * which also picks the `one`, `few`, or `other` form. Only `few` may be added:
 * languages whose plural rules have that category, such as Czech, must give it.
 */
export const el = {
  site: {
    tagline: "Οικογενειακές Συνταγές",
    description:
      "Ένας ζεστός, προσωπικός οδηγός με τις αγαπημένες μας συνταγές, τα μικρά μυστικά της κουζίνας μας και τις ιστορίες που τις συνοδεύουν.",
  },
  nav: {
    home: "Αρχική σελίδα",
    recipes: "Συνταγές",
    stories: "Ιστορίες",
    allRecipes: "Όλες οι συνταγές",
    allStories: "Όλες οι ιστορίες",
    language: "Γλώσσα",
  },
  footer: {
    tagline: "Οικογενειακές συνταγές και οι ιστορίες τους.",
    madeWith: "Φτιαγμένο με",
    love: "αγάπη",
    forFamily: "για την οικογένεια",
  },
  home: {
    eyebrow: "Το οικογενειακό τετράδιο συνταγών",
    headline: "Κάποιες αναμνήσεις μας είναι γεμάτες γεύσεις,",
    headlineEmphasis: "και κάποιες γεύσεις είναι γεμάτες αναμνήσεις μας.",
    intro: "Τα Ρουδομαγειρέματα είναι μια μικρή συλλογή από συνταγές που έχουν γεύση σπίτι ή και ταξίδια.",
    browse: "Ξεφύλλισε τις συνταγές μας",
    readStories: "Διάβασε τις ιστορίες μας",
    quote:
      "Κάποιες συνταγές ξεκινάνε με λαδάκι και κρεμμυδάκι, αλλά οι καλύτερες αρχίζουν με κάποιον να λέει «Θυμάσαι τότε που…;»",
    statRecipes: "Συνταγές",
    statCategories: "Κεφάλαια",
    statStories: "Ιστορίες",
    chaptersEyebrow: "Περιεχόμενα",
    chaptersTitle: "Τα κεφάλαια του τετραδίου",
    chaptersIntro:
      "Κάθε πρόσωπο της οικογένειας έχει τη δική του θέση εδώ. Ανακάλυψε τις ιστορίες και τα πιατάκια που τους κάνουν ξεχωριστούς!",
    latestEyebrow: "Τελευταίες συνταγές",
    latestTitle: "Φρέσκες από την κουζίνα",
  },
  recipesPage: {
    title: "Οι συνταγές της οικογένειας",
    intro: "Ψάξε με το όνομα ή με ένα υλικό, ή διάλεξε το κεφάλαιο που σε τραβάει.",
  },
  recipeList: {
    searchPlaceholder: "Συνταγή, υλικό ή ετικέτα…",
    searchLabel: "Αναζήτηση συνταγής",
    clearSearch: "Καθαρισμός αναζήτησης",
    allCategories: "Όλες",
    categoriesLabel: "Κεφάλαια",
    emptyTitle: "Δε βρέθηκαν συνταγές",
    emptyText: "Δοκίμασε να αλλάξεις τους όρους αναζήτησης ή να επιλέξεις άλλο κεφάλαιο.",
    resetFilters: "Καθαρισμός φίλτρων",
  },
  recipeCard: {
    hasStory: "Με οικογενειακή ιστορία",
  },
  recipe: {
    untranslated: "Αυτή η συνταγή δεν έχει μεταφραστεί ακόμα, οπότε εμφανίζεται στα ελληνικά.",
    otherCategory: "Άλλο",
    prepTime: "Προετοιμασία",
    cookTime: "Μαγείρεμα",
    servings: "Μερίδες",
    updated: "Ανανεώθηκε",
    story: "Η ιστορία πίσω από τη συνταγή",
    readStory: "Διάβασε όλη την ιστορία",
    mentionedIn: "Τη συναντάς και σε αυτές τις ιστορίες",
    moreFrom: "Από το ίδιο κεφάλαιο",
    ingredients: "Υλικά",
    ingredientsHint: "Τσέκαρε ό,τι έχεις ήδη ετοιμάσει.",
    steps: "Εκτέλεση",
  },
  stories: {
    eyebrow: "Το ημερολόγιο",
    title: "Ιστορίες από το τραπέζι μας",
    intro:
      "Κάθε συνταγή κουβαλάει και μια ανάμνηση. Τις κρατάμε εδώ όλες μαζί, για να θυμόμαστε ποιος μαγείρευε, πότε, και γιατί γελούσαμε.",
    read: "Διάβασε την ιστορία",
    label: "Οικογενειακή ιστορία",
    recipeLabel: "Συνταγή",
    recipe: "Η συνταγή της ιστορίας",
    viewRecipe: "Δες τη συνταγή",
    alsoMentioned: "Στην ιστορία αναφέρονται επίσης",
    previous: "Προηγούμενη ιστορία",
    next: "Επόμενη ιστορία",
    untranslated: "Αυτή η ιστορία δεν έχει μεταφραστεί ακόμα, οπότε εμφανίζεται στα ελληνικά.",
  },
  tags: {
    label: "Ετικέτες",
  },
  counts: {
    recipes: { one: "{count} συνταγή", other: "{count} συνταγές" },
    stories: { one: "{count} ιστορία", other: "{count} ιστορίες" },
    found: { one: "Βρέθηκε {count} συνταγή", other: "Βρέθηκαν {count} συνταγές" },
    servings: { one: "{count} μερίδα", other: "{count} μερίδες" },
    ingredients: { one: "{count} υλικό", other: "{count} υλικά" },
    steps: { one: "{count} βήμα", other: "{count} βήματα" },
  },
};

export type Messages = Omit<typeof el, "counts"> & { counts: Record<keyof (typeof el)["counts"], PluralForms> };
