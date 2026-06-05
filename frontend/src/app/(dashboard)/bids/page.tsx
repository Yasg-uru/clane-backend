import type { ReactElement } from "react";
import { CreatorBidsPage } from "@/components/bid/creator-bids-page";

export const metadata = { title: "My Bids — CreatorLane" };

export default function Page(): ReactElement {
  return <CreatorBidsPage />;
}
