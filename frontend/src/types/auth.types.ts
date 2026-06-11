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

export const SocialProvider = {
  GOOGLE: "google",
  INSTAGRAM: "instagram",
  YOUTUBE: "youtube",
} as const;
export type SocialProvider = (typeof SocialProvider)[keyof typeof SocialProvider];

export const SocialAuthStatus = {
  AUTHENTICATED: "authenticated",
  PROFILE_INCOMPLETE: "profile_incomplete",
  PENDING_EMAIL_VERIFICATION: "pending_email_verification",
  PENDING_EMAIL_SUBMISSION: "pending_email_submission",
} as const;
export type SocialAuthStatus = (typeof SocialAuthStatus)[keyof typeof SocialAuthStatus];

interface SafeUserBase {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  city: string;
  isEmailVerified: boolean;
  authProvider: AuthProvider;
  authProviders: AuthProvider[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SafeBrand extends SafeUserBase {
  role: typeof UserRole.BRAND;
  brandName: string;
  brandType: string;
  instagramHandle?: string;
  instagramFollowers?: number;
  instagramBio?: string;
  instagramConnected?: boolean;
  instagramProfilePicUrl?: string;
  googleConnected: boolean;
  isProfileComplete: boolean;
}

export interface SafeCreator extends SafeUserBase {
  role: typeof UserRole.CREATOR;
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  instagramProfilePicUrl?: string;
  googleConnected: boolean;
  youtubeConnected: boolean;
  instagramAuthenticityScore?: number;
  instagramAuthenticityRisk?: string;
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

export interface SocialAuthCallbackResult {
  status: SocialAuthStatus;
  accessToken: string | null;
  intermediateToken: string | null;
  user: SafeUser | null;
  instagramTokenExpiringSoon?: boolean;
  instagramTokenExpired?: boolean;
}

export interface OAuthInitiateResult {
  url: string;
}
