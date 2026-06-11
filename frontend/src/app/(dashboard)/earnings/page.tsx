import type { ReactElement } from "react";
import { CreatorEarningsPage } from "@/components/earnings/creator-earnings-page";

export const metadata = { title: "Earnings — CreatorLane" };

export default function Page(): ReactElement {
  return <CreatorEarningsPage />;
}
