import {
  SocialProvider,
  UserRole,
  type SafeBrand,
  type SafeCreator,
  type SafeUser,
  type SocialProvider as SocialProviderType,
} from "@/types";

/** Whether the given social provider is currently linked to the user. */
export function isProviderConnected(
  user: SafeUser,
  provider: SocialProviderType,
): boolean {
  const isCreator = user.role === UserRole.CREATOR;
  switch (provider) {
    case SocialProvider.INSTAGRAM:
      return isCreator
        ? Boolean((user as SafeCreator).instagramProfilePicUrl)
        : Boolean((user as SafeBrand).instagramConnected);
    case SocialProvider.YOUTUBE:
      return isCreator ? (user as SafeCreator).youtubeConnected : false;
    case SocialProvider.GOOGLE:
      return user.googleConnected;
    default:
      return false;
  }
}

/** A short label describing the active connection (handle, or "Connected"). */
export function providerConnectionDetail(
  user: SafeUser,
  provider: SocialProviderType,
): string {
  if (
    provider === SocialProvider.INSTAGRAM &&
    "instagramHandle" in user &&
    user.instagramHandle
  ) {
    return user.instagramHandle;
  }
  return "Connected";
}
