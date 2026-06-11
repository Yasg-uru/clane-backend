import type { ReactElement } from "react";
import { CreatorsPage } from "@/components/creator/creators-page";

export const metadata = { title: "Browse Creators — CreatorLane" };

export default function Page(): ReactElement {
  return <CreatorsPage />;
}
