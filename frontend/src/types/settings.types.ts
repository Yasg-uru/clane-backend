// ── Settings domain types ────────────────────────────────────────────────────

/** Identifies each navigable section in the settings screen. */
export const SettingsSection = {
  PROFILE: "profile",
  ACCOUNT: "account",
  CONNECTIONS: "connections",
  NOTIFICATIONS: "notifications",
  APPEARANCE: "appearance",
  DANGER: "danger",
} as const;
export type SettingsSection = (typeof SettingsSection)[keyof typeof SettingsSection];

/** A single toggleable notification preference. */
export const NotificationPrefKey = {
  PRODUCT_UPDATES: "productUpdates",
  CAMPAIGN_INVITES: "campaignInvites",
  BID_ACTIVITY: "bidActivity",
  COLLAB_MESSAGES: "collabMessages",
  PAYMENT_ALERTS: "paymentAlerts",
  WEEKLY_DIGEST: "weeklyDigest",
} as const;
export type NotificationPrefKey =
  (typeof NotificationPrefKey)[keyof typeof NotificationPrefKey];

/** Where a notification can be delivered. */
export const NotificationChannel = {
  EMAIL: "email",
  PUSH: "push",
} as const;
export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export type NotificationPreferences = Record<
  NotificationPrefKey,
  Record<NotificationChannel, boolean>
>;
