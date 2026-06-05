import type { LucideIcon } from "lucide-react";
import {
  UserCircle,
  ShieldCheck,
  Link2,
  Bell,
  Palette,
  TriangleAlert,
} from "lucide-react";
import type { IconType } from "react-icons";
import { FaInstagram, FaYoutube, FaGoogle } from "react-icons/fa";
import { SettingsSection, NotificationPrefKey } from "@/types/settings.types";
import { SocialProvider, UserRole, type SocialProvider as SocialProviderType } from "@/types";

export type SettingsNavItem = {
  id: SettingsSection;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Visually flags destructive sections. */
  destructive?: boolean;
};

export const SETTINGS_NAV: readonly SettingsNavItem[] = [
  {
    id: SettingsSection.PROFILE,
    label: "Profile",
    description: "Your public identity on CreatorLane",
    icon: UserCircle,
  },
  {
    id: SettingsSection.ACCOUNT,
    label: "Account & Security",
    description: "Email, password and login security",
    icon: ShieldCheck,
  },
  {
    id: SettingsSection.CONNECTIONS,
    label: "Connections",
    description: "Linked social and payout accounts",
    icon: Link2,
  },
  {
    id: SettingsSection.NOTIFICATIONS,
    label: "Notifications",
    description: "Choose what reaches your inbox",
    icon: Bell,
  },
  {
    id: SettingsSection.APPEARANCE,
    label: "Appearance",
    description: "Theme and accent customization",
    icon: Palette,
  },
  {
    id: SettingsSection.DANGER,
    label: "Danger Zone",
    description: "Irreversible account actions",
    icon: TriangleAlert,
    destructive: true,
  },
] as const;

export type ConnectionProvider = {
  provider: SocialProviderType;
  label: string;
  description: string;
  icon: IconType;
  /** Tailwind classes for the provider's brand tint. */
  accent: string;
  /** Roles for which this connection is offered. */
  roles: readonly UserRole[];
};

export const CONNECTION_PROVIDERS: readonly ConnectionProvider[] = [
  {
    provider: SocialProvider.INSTAGRAM,
    label: "Instagram",
    description: "Syncs your handle, audience and authenticity score.",
    icon: FaInstagram,
    accent: "text-pink-600 dark:text-pink-400 bg-pink-500/10",
    roles: [UserRole.CREATOR, UserRole.BRAND],
  },
  {
    provider: SocialProvider.YOUTUBE,
    label: "YouTube",
    description: "Imports subscriber count and average views.",
    icon: FaYoutube,
    accent: "text-red-600 dark:text-red-400 bg-red-500/10",
    roles: [UserRole.CREATOR],
  },
  {
    provider: SocialProvider.GOOGLE,
    label: "Google",
    description: "One-tap sign in with your Google account.",
    icon: FaGoogle,
    accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    roles: [UserRole.CREATOR, UserRole.BRAND],
  },
] as const;

export type NotificationPrefDefinition = {
  key: NotificationPrefKey;
  label: string;
  description: string;
};

export const NOTIFICATION_PREFS: readonly NotificationPrefDefinition[] = [
  {
    key: NotificationPrefKey.CAMPAIGN_INVITES,
    label: "Campaign invites",
    description: "When a brand invites you to a campaign or your bid is shortlisted.",
  },
  {
    key: NotificationPrefKey.BID_ACTIVITY,
    label: "Bid activity",
    description: "Updates when your bids are accepted, declined or countered.",
  },
  {
    key: NotificationPrefKey.COLLAB_MESSAGES,
    label: "Collab messages",
    description: "New messages and deliverable feedback inside a collab room.",
  },
  {
    key: NotificationPrefKey.PAYMENT_ALERTS,
    label: "Payments & payouts",
    description: "Escrow funding, releases and withdrawal confirmations.",
  },
  {
    key: NotificationPrefKey.WEEKLY_DIGEST,
    label: "Weekly digest",
    description: "A Monday summary of new campaigns matching your niche.",
  },
  {
    key: NotificationPrefKey.PRODUCT_UPDATES,
    label: "Product updates",
    description: "Occasional news about new CreatorLane features.",
  },
] as const;
