import type { Metadata } from "next";
import { CampaignWizard } from "@/components/campaign/campaign-wizard";

export const metadata: Metadata = { title: "Create Campaign" };

export default function CreateCampaignPage() {
  return <CampaignWizard />;
}
