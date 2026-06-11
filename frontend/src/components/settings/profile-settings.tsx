"use client";

import type { ReactElement } from "react";
import { CreatorProfileForm } from "./creator-profile-form";
import { BrandProfileForm } from "./brand-profile-form";
import { UserRole, type SafeBrand, type SafeCreator, type SafeUser } from "@/types";

type ProfileSettingsProps = { user: SafeUser };

export function ProfileSettings({ user }: ProfileSettingsProps): ReactElement {
  return user.role === UserRole.BRAND ? (
    <BrandProfileForm user={user as SafeBrand} />
  ) : (
    <CreatorProfileForm user={user as SafeCreator} />
  );
}
