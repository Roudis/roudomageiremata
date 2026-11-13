import { describe, expect, it } from "vitest";
import {
  hasMalformedMention,
  mentionText,
  parseStory,
  storyExcerpt,
  storyMentions,
  storyPlainText,
} from "@/lib/story-text";

const titles = { spetsofai: "Σπετσοφάι Β!", "o-mousakas-tis-giagias": "Ο Μουσακάς της γιαγιάς" };

describe("parseStory", () => {
  it("returns plain text as one paragraph with one segment", () => {
    expect(parseStory("Κάθε Κυριακή μαζευόμασταν.")).toEqual([[{ type: "text", text: "Κάθε Κυριακή μαζευόμασταν." }]]);
  });

  it("splits paragraphs on blank lines and keeps single line breaks inside one", () => {
    expect(parseStory("Πρώτη.\n\nΔεύτερη,\nίδια παράγραφος.\n \n\nΤρίτη.")).toEqual([
      [{ type: "text", text: "Πρώτη." }],
      [{ type: "text", text: "Δεύτερη,\nίδια παράγραφος." }],
      [{ type: "text", text: "Τρίτη." }],
    ]);
  });

  it("turns [[id]] into a mention without a label", () => {
    expect(parseStory("Μετά ήρθε το [[spetsofai]].")).toEqual([
      [
        { type: "text", text: "Μετά ήρθε το " },
        { type: "recipe", id: "spetsofai" },
        { type: "text", text: "." },
      ],
    ]);
  });

  it("turns [[id|words]] into a mention with those words, trimmed", () => {
    expect(parseStory("[[o-mousakas-tis-giagias| τον μουσακά ]] τον φάγαμε όλο")).toEqual([
      [
        { type: "recipe", id: "o-mousakas-tis-giagias", label: "τον μουσακά" },
        { type: "text", text: " τον φάγαμε όλο" },
      ],
    ]);
  });

  it("treats an empty label as no label", () => {
    expect(parseStory("[[spetsofai|]]")).toEqual([[{ type: "recipe", id: "spetsofai" }]]);
  });

  it("handles several mentions in one paragraph", () => {
    const [paragraph] = parseStory("[[spetsofai]] και [[o-mousakas-tis-giagias|μουσακάς]]");
    expect(paragraph.map((segment) => segment.type)).toEqual(["recipe", "text", "recipe"]);
  });

  it("leaves text that is not a recipe id as written", () => {
    expect(parseStory("Είπε [[Όχι Συνταγή]] και [μία] αγκύλη.")).toEqual([
      [{ type: "text", text: "Είπε [[Όχι Συνταγή]] και [μία] αγκύλη." }],
    ]);
  });

  it("returns no paragraphs for blank text", () => {
    expect(parseStory(" \n\n ")).toEqual([]);
  });
});

describe("storyMentions", () => {
  it("lists each mentioned id once, in order of first appearance", () => {
    expect(storyMentions("[[spetsofai]], [[o-mousakas-tis-giagias|μουσακάς]] και πάλι [[spetsofai|σπετσοφάι]]")).toEqual([
      "spetsofai",
      "o-mousakas-tis-giagias",
    ]);
  });

  it("returns nothing for a story without mentions", () => {
    expect(storyMentions("Καμία συνταγή εδώ.")).toEqual([]);
  });
});

describe("mentionText", () => {
  it("prefers the mention's own words", () => {
    expect(mentionText({ id: "spetsofai", label: "το σπετσοφάι" }, titles)).toBe("το σπετσοφάι");
  });

  it("falls back to the recipe's title", () => {
    expect(mentionText({ id: "spetsofai" }, titles)).toBe("Σπετσοφάι Β!");
  });

  it("falls back to the id for a recipe that does not exist", () => {
    expect(mentionText({ id: "toString" }, titles)).toBe("toString");
  });
});

describe("storyPlainText", () => {
  it("replaces mentions with what they show and joins paragraphs with a space", () => {
    expect(storyPlainText("Φάγαμε [[spetsofai]].\n\nΜετά [[o-mousakas-tis-giagias|μουσακά]].", titles)).toBe(
      "Φάγαμε Σπετσοφάι Β!. Μετά μουσακά.",
    );
  });
});

describe("storyExcerpt", () => {
  it("returns a short story whole", () => {
    expect(storyExcerpt("Μικρή ιστορία.", titles, 50)).toBe("Μικρή ιστορία.");
  });

  it("cuts a long story at a word boundary and adds an ellipsis", () => {
    expect(storyExcerpt("Μια φορά κι έναν καιρό, ήταν μια κατσαρόλα.", titles, 24)).toBe("Μια φορά κι έναν καιρό…");
  });

  it("cuts text without spaces at the limit", () => {
    expect(storyExcerpt("あ".repeat(30), titles, 10)).toBe(`${"あ".repeat(10)}…`);
  });

  it("never shows link markup", () => {
    expect(storyExcerpt("Το [[spetsofai|σπετσοφάι της μαμάς]] ήταν πάντα εκεί, κάθε Κυριακή.", titles, 30)).not.toContain("[");
  });
});

describe("hasMalformedMention", () => {
  it("accepts text without brackets and well-formed mentions", () => {
    expect(hasMalformedMention("Απλό κείμενο [με μία αγκύλη].")).toBe(false);
    expect(hasMalformedMention("[[spetsofai]] και [[spetsofai|λέξεις]]")).toBe(false);
  });

  it("flags a title used instead of an id, and unbalanced brackets", () => {
    expect(hasMalformedMention("[[Σπετσοφάι Β!]]")).toBe(true);
    expect(hasMalformedMention("[[spetsofai")).toBe(true);
    expect(hasMalformedMention("spetsofai]]")).toBe(true);
    expect(hasMalformedMention("[[Spetsofai]]")).toBe(true);
  });
});
