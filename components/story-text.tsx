import { Fragment } from "react";
import Link from "next/link";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { mentionText, parseStory, type RecipeTitles, type StorySegment } from "@/lib/story-text";

// A recipe's name inside a story. Underlined, so it reads as a link in running text.
const linkTones = {
  page: "text-primary decoration-primary/35 hover:decoration-primary",
  feature: "text-feature-accent decoration-feature-accent/45 hover:decoration-feature-accent",
};

type StoryTextProps = {
  /** The story as written, with its `[[recipe-id]]` links; see lib/story-text.ts. */
  story: string;
  /** Titles of the recipes that exist, in the page's language. A mention of any other id is plain text. */
  titles: RecipeTitles;
  locale: Locale;
  /** The recipe whose own page this is: a link to it would lead nowhere, so its mentions are plain text. */
  currentRecipeId?: string;
  /** `feature` on the aubergine story band. */
  tone?: keyof typeof linkTones;
  /** One paragraph with the breaks turned into spaces, so a teaser can be clamped to a few lines. */
  inline?: boolean;
  /** Classes for the wrapper, or for the single paragraph when `inline`. */
  className?: string;
  /** Extra classes for the first paragraph, such as a drop cap. */
  firstParagraphClassName?: string;
  /** The story's language when it differs from the page's: Greek, for an untranslated recipe. */
  lang?: Locale;
};

/** A story's text, with every recipe it mentions as a link to that recipe. */
export function StoryText({
  story,
  titles,
  locale,
  currentRecipeId,
  tone = "page",
  inline = false,
  className,
  firstParagraphClassName = "",
  lang,
}: StoryTextProps) {
  const paragraphs = parseStory(story);

  const renderSegment = (segment: StorySegment, key: number) => {
    if (segment.type === "text") return <Fragment key={key}>{segment.text}</Fragment>;

    const text = mentionText(segment, titles);
    if (segment.id === currentRecipeId || !Object.hasOwn(titles, segment.id)) return <Fragment key={key}>{text}</Fragment>;

    return (
      <Link
        key={key}
        href={localizePath(`/recipes/${segment.id}`, locale)}
        className={`rounded-sm font-medium underline decoration-2 underline-offset-4 transition-colors focus-ring ${linkTones[tone]}`}
      >
        {text}
      </Link>
    );
  };

  if (inline) {
    return (
      <p lang={lang} className={className}>
        {paragraphs.map((segments, index) => (
          <Fragment key={index}>
            {index > 0 && " "}
            {segments.map(renderSegment)}
          </Fragment>
        ))}
      </p>
    );
  }

  return (
    <div lang={lang} className={className}>
      {paragraphs.map((segments, index) => (
        // pre-line keeps a single line break the writer put inside a paragraph.
        <p key={index} className={`whitespace-pre-line text-pretty ${index === 0 ? firstParagraphClassName : ""}`}>
          {segments.map(renderSegment)}
        </p>
      ))}
    </div>
  );
}
