export const USER_ROLES = ["brand", "creator"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
  jti?: string;
  exp?: number;
}

interface SafeUserBase {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  city: string;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SafeBrand extends SafeUserBase {
  role: "brand";
  brandName: string;
  brandType: string;
  instagramHandle?: string;
}

export interface SafeCreator extends SafeUserBase {
  role: "creator";
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
}

export type SafeUser = SafeBrand | SafeCreator;
