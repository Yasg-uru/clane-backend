import type { SafeCreator } from "@/types";
import { User } from "./User";

export class CreatorUser extends User {
  readonly instagramHandle: string;
  readonly instagramFollowers: number;
  readonly niche: string[];
  readonly profilePhotoUrl?: string;
  readonly isProfileComplete: boolean;

  constructor(data: SafeCreator) {
    super(data);
    this.instagramHandle = data.instagramHandle;
    this.instagramFollowers = data.instagramFollowers;
    this.niche = data.niche;
    this.profilePhotoUrl = data.profilePhotoUrl;
    this.isProfileComplete = data.isProfileComplete;
  }

  get displayName(): string {
    return `@${this.instagramHandle.replace(/^@/, "")}`;
  }

  get isOnboarded(): boolean {
    return this.isProfileComplete && this.isEmailVerified;
  }

  get dashboardPath(): string {
    return "/dashboard";
  }
}
