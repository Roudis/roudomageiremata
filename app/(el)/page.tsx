import { HomePage, homeMetadata } from "@/app/_shared/home-page";

export const metadata = homeMetadata("el");

export default function GreekHome() {
  return <HomePage locale="el" />;
}
