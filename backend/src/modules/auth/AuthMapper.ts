import { UserRole } from "../../core/types";
import type { AuthDocument, SafeBrand, SafeCreator, SafeUser } from "../../core/types";

const toIso = (value: Date | undefined): string | undefined =>
  value ? value.toISOString() : undefined;

export class AuthMapper {
  static toSafeUser(user: AuthDocument): SafeUser {
    const base = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      city: user.city,
      isEmailVerified: user.isEmailVerified,
      authProvider: user.authProvider,
      createdAt: toIso(user.createdAt),
      updatedAt: toIso(user.updatedAt),
    };

    if (user.role === UserRole.Brand) {
      const safeBrand: SafeBrand = {
        ...base,
        role: UserRole.Brand,
        brandName: user.brandName,
        brandType: user.brandType,
        instagramHandle: user.instagramHandle,
        profilePhotoUrl: user.profilePhotoUrl,
        googleConnected: user.googleConnected,
        isProfileComplete: user.isProfileComplete,
      };
      return safeBrand;
    }

    const safeCreator: SafeCreator = {
      ...base,
      role: UserRole.Creator,
      instagramHandle: user.instagramHandle,
      instagramFollowers: user.instagramFollowers,
      niche: user.niche,
      instagramProfilePicUrl: user.instagramProfilePicUrl,
      instagramConnected: user.instagramConnected,
      instagramVerified: user.instagramVerified,
      instagramDataLastRefreshedAt: toIso(user.instagramDataLastRefreshedAt),
    };
    return safeCreator;
  }
}
