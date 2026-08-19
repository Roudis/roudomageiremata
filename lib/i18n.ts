export type Locale = "el" | "en";

export const defaultLocale: Locale = "el";

export const dictionaries = {
  el: {
    siteName: "Ρούδομαγειρέματα",
    heroTitlePart1: "Κάποιες αναμνήσεις μας είναι γεμάτες γεύσεις ",
    heroTitlePart2: "και κάποιες γεύσεις είναι γεμάτες αναμνήσεις μας.",
    heroDescription: "Τα Ρουδομαγειρέματα είναι μια μικρή συλλογή από συνταγές που έχουν γεύση σπίτι ή και ταξίδια.",
    browseRecipes: "Ξεφύλλισε τις συνταγές μας",
    notebook: "Το Τετραδιακι Μας",
    familyRecipesCount: "Αγαπημένα οικογενειακά πιατάκια.",
    quote: "“Κάποιες συνταγές ξεκινάνε με λαδάκι και κρεμμυδάκι, αλλά οι καλύτερες αρχίζουν με κάποιον να λέει, 'Θυμάσαι τότε που...;'”",
    familyRecipesTitle: "Οι συνταγές της οικογένειας",
    familyRecipesDescription: "Κάθε πρόσωπο της οικογένειας έχει τη δική του θέση εδώ. Ανακάλυψε τις ιστορίες και τα πιατάκια που τους κάνουν ξεχωριστούς!",
    prepTime: "Προετοιμασία",
    cookTime: "Μαγείρεμα",
    servings: "Μερίδες",
    ingredients: "Υλικά",
    steps: "Εκτέλεση",
    story: "Η ιστορία πίσω από τη συνταγή",
    mins: "λεπτά",
    backToHome: "Πίσω στη Συλλογή",
    other: "Άλλο",
    kitchenNotes: "Σημειώσεις της Κουζίνας",
    updated: "Ανανεώθηκε",
    recipeMemory: "Ανάμνηση Συνταγής",
    familyFavorite: "Αγαπημένο της Οικογένειας",
    categories: {
      "Του Μπαμπούλα (που δεν είναι μόνο ψάρια)": "Του Μπαμπούλα (που δεν είναι μόνο ψάρια)",
      "Της Φωτεινούλας (γλυκά και ζύμες)": "Της Φωτεινούλας (γλυκά και ζύμες)",
      "Της Ρηνούλας (για τους μερακλήδες)": "Της Ρηνούλας (για τους μερακλήδες)",
      "Του Άλκη (με άρωμα εξωτερικού)": "Του Άλκη (με άρωμα εξωτερικού)",
      "Άλλο": "Άλλο",
    }
  },
  en: {
    siteName: "Roudomageiremata",
    heroTitlePart1: "Some of our memories are full of flavors ",
    heroTitlePart2: "and some flavors are full of our memories.",
    heroDescription: "Roudomageiremata is a small collection of recipes that taste like home or travels.",
    browseRecipes: "Browse our recipes",
    notebook: "Our Notebook",
    familyRecipesCount: "Favorite family dishes.",
    quote: "“Some recipes start with a little oil and onion, but the best ones start with someone saying, 'Do you remember when...?'”",
    familyRecipesTitle: "Family Recipes",
    familyRecipesDescription: "Every person in the family has their own place here. Discover the stories and the dishes that make them special!",
    prepTime: "Prep",
    cookTime: "Cook",
    servings: "Servings",
    ingredients: "Ingredients",
    steps: "Instructions",
    story: "The story behind the recipe",
    mins: "mins",
    backToHome: "Back to Collection",
    other: "Other",
    kitchenNotes: "Kitchen Notes",
    updated: "Updated",
    recipeMemory: "Recipe Memory",
    familyFavorite: "Family Favorite",
    categories: {
      "Του Μπαμπούλα (που δεν είναι μόνο ψάρια)": "Baboulas's (not just fish)",
      "Της Φωτεινούλας (γλυκά και ζύμες)": "Foteinoula's (sweets and doughs)",
      "Της Ρηνούλας (για τους μερακλήδες)": "Rinoula's (for the foodies)",
      "Του Άλκη (με άρωμα εξωτερικού)": "Alkis's (with a foreign scent)",
      "Άλλο": "Other",
    }
  }
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
