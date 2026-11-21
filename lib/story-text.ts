/**
 * Story text and the recipes it mentions. A story is plain text in which
 * `[[recipe-id]]` stands for a link to that recipe showing its title, and
 * `[[recipe-id|words]]` for a link showing those words instead, so the name can
 * follow the sentence's grammar. A blank line starts a new paragraph.
 * Pure, so it is safe on either side.
 */

export type StorySegment =
  | { type: "text"; text: string }
  /** `label` is the text after the bar, when the story gives one. */
  | { type: "recipe"; id: string; label?: string };

/** Recipe titles by id, in the page's language; see `recipeTitles` in lib/recipe-view.ts. */
export type RecipeTitles = Readonly<Record<string, string>>;

// The id is a recipe slug; the label is anything on the same line without square brackets.
const MENTION = /\[\[([a-z0-9]+(?:-[a-z0-9]+)*)(?:\|([^[\]\n]*))?\]\]/g;

/** One run of text as plain text and recipe mentions, in order. */
function parseSegments(text: string): StorySegment[] {
  const segments: StorySegment[] = [];
  let end = 0;
  for (const match of Array.from(text.matchAll(MENTION))) {
    if (match.index > end) segments.push({ type: "text", text: text.slice(end, match.index) });
    const label = match[2]?.trim();
    segments.push(label ? { type: "recipe", id: match[1], label } : { type: "recipe", id: match[1] });
    end = match.index + match[0].length;
  }
  if (end < text.length) segments.push({ type: "text", text: text.slice(end) });
  return segments;
}

/**
 * The story as paragraphs of segments. Blank lines separate paragraphs; a single
 * line break stays inside its paragraph's text.
 */
export function parseStory(story: string): StorySegment[][] {
  return story
    .split(/\n[ \t]*\n\s*/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "")
    .map(parseSegments);
}

/** The ids of the recipes a story mentions, each once, in the order they first appear. */
export function storyMentions(story: string): string[] {
  return Array.from(new Set(Array.from(story.matchAll(MENTION), (match) => match[1])));
}

/**
 * What a mention shows: its own words, else the recipe's title from `titles`,
 * else the id, which only happens for a recipe that does not exist.
 */
export function mentionText(mention: { id: string; label?: string }, titles: RecipeTitles): string {
  if (mention.label !== undefined) return mention.label;
  return Object.hasOwn(titles, mention.id) ? titles[mention.id] : mention.id;
}

/** The story without link markup, as one line: for excerpts and page descriptions. */
export function storyPlainText(story: string, titles: RecipeTitles): string {
  return story
    .replace(MENTION, (_, id: string, label?: string) => mentionText({ id, label: label?.trim() || undefined }, titles))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The start of the story as plain text, at most `maxLength` characters, cut at a
 * word boundary with an ellipsis. Text without spaces, such as Japanese, is cut
 * at `maxLength`.
 */
export function storyExcerpt(story: string, titles: RecipeTitles, maxLength: number): string {
  const text = storyPlainText(story, titles);
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:·!?…—–-]+$/, "")}…`;
}

/**
 * True when the story has `[[` or `]]` left over once every well-formed mention
 * is taken out: a typo such as `[[Some Title]]` or a missing bracket, which
 * would otherwise show on the page as written.
 */
export function hasMalformedMention(story: string): boolean {
  const rest = story.replace(MENTION, "");
  return rest.includes("[[") || rest.includes("]]");
}
