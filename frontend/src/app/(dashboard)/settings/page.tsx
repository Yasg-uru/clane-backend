import type { ReactElement } from "react";
import { SettingsPage } from "@/components/settings/settings-page";

export const metadata = { title: "Settings — CreatorLane" };

export default function Page(): ReactElement {
  return <SettingsPage />;
}
