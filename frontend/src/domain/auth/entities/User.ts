import type { UserRole, AuthProvider, SafeUser } from "@/types";

export abstract class User {
  readonly id: string;
  readonly role: UserRole;
  readonly fullName: string;
  readonly email: string;
  readonly city: string;
  readonly isEmailVerified: boolean;
  readonly authProvider: AuthProvider;
  readonly createdAt?: string;

  protected constructor(data: SafeUser) {
    this.id = data.id;
    this.role = data.role;
    this.fullName = data.fullName;
    this.email = data.email;
    this.city = data.city;
    this.isEmailVerified = data.isEmailVerified;
    this.authProvider = data.authProvider;
    this.createdAt = data.createdAt;
  }

  get initials(): string {
    return this.fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  abstract get displayName(): string;
  abstract get isOnboarded(): boolean;
  abstract get dashboardPath(): string;
}
