export const UserRole = {
  BRAND: "brand",
  CREATOR: "creator",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AuthProvider = {
  EMAIL: "email",
  INSTAGRAM: "instagram",
  GOOGLE: "google",
  BOTH: "both",
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

interface SafeUserBase {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  city: string;
  isEmailVerified: boolean;
  authProvider: AuthProvider;
  createdAt?: string;
  updatedAt?: string;
}

export interface SafeBrand extends SafeUserBase {
  role: typeof UserRole.BRAND;
  brandName: string;
  brandType: string;
  instagramHandle?: string;
  profilePhotoUrl?: string;
  googleConnected: boolean;
  isProfileComplete: boolean;
}

export interface SafeCreator extends SafeUserBase {
  role: typeof UserRole.CREATOR;
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  profilePhotoUrl?: string;
  isProfileComplete: boolean;
}

export type SafeUser = SafeBrand | SafeCreator;

export interface LoginResult {
  accessToken: string;
  user: SafeUser;
}

export interface RefreshResult {
  accessToken: string;
  user: SafeUser;
}

export interface RegisterResult {
  message: string;
}
