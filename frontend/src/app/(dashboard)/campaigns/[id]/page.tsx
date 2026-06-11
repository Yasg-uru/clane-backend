import type { ReactElement } from "react";
import { CampaignDetail } from "@/components/campaign/campaign-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: Props): Promise<ReactElement> {
  const { id } = await params;
  return <CampaignDetail id={id} />;
}
