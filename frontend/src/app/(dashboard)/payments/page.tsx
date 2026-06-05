import type { ReactElement } from "react";
import { BrandPaymentsPage } from "@/components/payment/brand-payments-page";

export const metadata = { title: "Payments — CreatorLane" };

export default function Page(): ReactElement {
  return <BrandPaymentsPage />;
}
