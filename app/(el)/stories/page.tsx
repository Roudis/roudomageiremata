import { StoriesPage, storiesMetadata } from "@/app/_shared/stories-page";

export const metadata = storiesMetadata("el");

export default function GreekStories() {
  return <StoriesPage locale="el" />;
}
