import type { Metadata } from "next";
import { StoryPage, storyMetadata, storyStaticParams } from "@/app/_shared/story-page";

/** The route's params, in one place: Next 15 and later hand `params` over as a Promise. */
type StoryParams = {
  id: string;
};

type GreekStoryProps = {
  params: StoryParams;
};

export function generateStaticParams(): Promise<StoryParams[]> {
  return storyStaticParams();
}

export function generateMetadata({ params }: GreekStoryProps): Promise<Metadata> {
  return storyMetadata(params.id, "el");
}

export default function GreekStory({ params }: GreekStoryProps) {
  return <StoryPage id={params.id} locale="el" />;
}
