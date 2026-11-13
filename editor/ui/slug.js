/**
 * A new recipe's id from its Greek title, letter by letter in the same Greeklish
 * as the existing ids: "Ο Μουσακάς της γιαγιάς" becomes "o-mousakas-tis-giagias".
 * Accents go, "ου" stays "oy", and anything that is not a letter or digit
 * becomes a single hyphen. Plain JavaScript, so the editor page can load it as
 * it is; editor/slug.test.ts checks it against the ids in data/recipes.
 */

const GREEKLISH = {
  α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i", κ: "k", λ: "l", μ: "m",
  ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o",
};

/**
 * @param {string} title
 * @returns {string}
 */
export function slugify(title) {
  const letters = Array.from(title.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase());
  return letters
    .map((letter) => (Object.hasOwn(GREEKLISH, letter) ? GREEKLISH[/** @type {keyof typeof GREEKLISH} */ (letter)] : letter))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The pattern every recipe id must match, the same as isRecipeId in lib/recipe-schema.ts. */
export const RECIPE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
