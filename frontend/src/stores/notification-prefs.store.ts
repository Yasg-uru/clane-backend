"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  NotificationPrefKey,
  NotificationChannel,
  type NotificationPreferences,
} from "@/types/settings.types";

function buildDefaults(): NotificationPreferences {
  const keys = Object.values(NotificationPrefKey);
  return keys.reduce((acc, key) => {
    acc[key] = {
      // Email on by default for actionable events; product updates muted.
      [NotificationChannel.EMAIL]: key !== NotificationPrefKey.PRODUCT_UPDATES,
      [NotificationChannel.PUSH]:
        key === NotificationPrefKey.BID_ACTIVITY ||
        key === NotificationPrefKey.COLLAB_MESSAGES ||
        key === NotificationPrefKey.PAYMENT_ALERTS,
    };
    return acc;
  }, {} as NotificationPreferences);
}

interface NotificationPrefsState {
  _hasHydrated: boolean;
  preferences: NotificationPreferences;
  setHasHydrated: (val: boolean) => void;
  toggle: (key: NotificationPrefKey, channel: NotificationChannel) => void;
  reset: () => void;
}

export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      preferences: buildDefaults(),

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      toggle: (key, channel) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            [key]: {
              ...s.preferences[key],
              [channel]: !s.preferences[key][channel],
            },
          },
        })),

      reset: () => set({ preferences: buildDefaults() }),
    }),
    {
      name: "clane-notification-prefs",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
