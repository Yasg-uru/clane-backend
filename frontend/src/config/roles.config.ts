import { UserRole } from "@/types";

export const USER_ROLES = [UserRole.BRAND, UserRole.CREATOR] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.BRAND]: "Brand",
  [UserRole.CREATOR]: "Creator",
};
