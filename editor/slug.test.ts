import { describe, expect, it } from "vitest";
import { RECIPE_ID, slugify } from "./ui/slug.js";
import { isRecipeId } from "@/lib/recipe-schema";

describe("slugify", () => {
  // Titles and ids from data/recipes, fixed here so renaming a recipe doesn't break the test.
  it.each([
    ["Εκείνο με το Εστραγκόν", "ekeino-me-to-estragkon"],
    ["Ενα ποτηράκι Λιμονστέλο (ή 2 ?)", "ena-potiraki-limonstelo-i-2"],
    ["Για να ανέβει ο σίδήρος ( τότε που έπαιζε ελντοράντο)", "gia-na-anevei-o-sidiros-tote-poy-epaize-elntoranto"],
    ["Η ΚΑΡΜΠΟΝΑΡΑ", "i-karmponara"],
    ["Κάτσε στα αυγά, τα τηγανητά σου", "katse-sta-ayga-ta-tiganita-soy"],
    ["Μακαρονάδα με κολοκύθι και μελτιζάνα ??", "makaronada-me-kolokythi-kai-meltizana"],
    ["Πάσχα Βαθυλακίσιο", "pascha-vathylakisio"],
    ["Ταξιδιάρα κοτόπιτα", "taxidiara-kotopita"],
    ["Το πιο νόστημο κοκκινιστό + μάσκα αερίων", "to-pio-nostimo-kokkinisto-maska-aerion"],
    ["Τσιλιχούδα", "tsilichoyda"],
    ["Ψωμί", "psomi"],
  ])("turns %j into the id %j", (title, id) => {
    expect(slugify(title)).toBe(id);
  });

  it("keeps Latin letters and digits, and drops their accents", () => {
    expect(slugify("Crème brûlée 2")).toBe("creme-brulee-2");
  });

  it("returns an empty string when nothing in the title can be kept", () => {
    expect(slugify(" ?! ")).toBe("");
  });

  it("matches lib/recipe-schema.ts about what an id is", () => {
    for (const value of ["tsilichoyda", "ela-moy-nte-1", "a", "Bad", "two--hyphens", "-edge", "spa ce", ""]) {
      expect(RECIPE_ID.test(value)).toBe(isRecipeId(value));
    }
  });
});
