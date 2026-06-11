"use client";

import type { ReactElement } from "react";
import { BrandCollabsPage } from "@/components/collab/brand-collabs-page";
import { CreatorCollabsPage } from "@/components/collab/creator-collabs-page";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { UserRole } from "@/types";

export default function Page(): ReactElement {
  const user = useCurrentUser();
  const isBrand = user?.role === UserRole.BRAND;
  return isBrand ? <BrandCollabsPage /> : <CreatorCollabsPage />;
}
