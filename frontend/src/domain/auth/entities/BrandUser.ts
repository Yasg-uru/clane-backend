import type { SafeBrand } from "@/types";
import { User } from "./User";

export class BrandUser extends User {
  readonly brandName: string;
  readonly brandType: string;
  readonly instagramHandle?: string;
  readonly profilePhotoUrl?: string;
  readonly googleConnected: boolean;
  readonly isProfileComplete: boolean;

  constructor(data: SafeBrand) {
    super(data);
    this.brandName = data.brandName;
    this.brandType = data.brandType;
    this.instagramHandle = data.instagramHandle;
    this.profilePhotoUrl = data.profilePhotoUrl;
    this.googleConnected = data.googleConnected;
    this.isProfileComplete = data.isProfileComplete;
  }

  get displayName(): string {
    return this.brandName;
  }

  get isOnboarded(): boolean {
    return this.isProfileComplete && this.isEmailVerified;
  }

  get dashboardPath(): string {
    return "/dashboard";
  }
}
