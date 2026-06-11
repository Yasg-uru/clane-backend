"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsSectionCard } from "./settings-section-card";
import { SettingsRow } from "./settings-row";
import { NOTIFICATION_PREFS } from "@/config/settings.config";
import { NotificationChannel } from "@/types/settings.types";
import { useNotificationPrefsStore } from "@/stores/notification-prefs.store";

const CHANNELS = [
  { channel: NotificationChannel.EMAIL, label: "Email" },
  { channel: NotificationChannel.PUSH, label: "Push" },
] as const;

export function NotificationSettings(): ReactElement {
  const preferences = useNotificationPrefsStore((s) => s.preferences);
  const toggle = useNotificationPrefsStore((s) => s.toggle);
  const reset = useNotificationPrefsStore((s) => s.reset);

  return (
    <SettingsSectionCard
      title="Notifications"
      description="Pick which updates reach you, and where. Changes save automatically."
      footer={
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Reset to defaults
        </Button>
      }
    >
      {/* Channel column headers */}
      <div className="mb-1 flex items-center justify-end gap-6 pr-0.5">
        {CHANNELS.map((c) => (
          <span
            key={c.channel}
            className="w-10 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {c.label}
          </span>
        ))}
      </div>

      <div className="divide-y divide-border/50">
        {NOTIFICATION_PREFS.map((pref) => (
          <SettingsRow
            key={pref.key}
            label={pref.label}
            description={pref.description}
            control={
              <div className="flex items-center gap-6">
                {CHANNELS.map((c) => (
                  <span key={c.channel} className="flex w-10 justify-center">
                    <Switch
                      checked={preferences[pref.key][c.channel]}
                      onCheckedChange={() => toggle(pref.key, c.channel)}
                      aria-label={`${pref.label} — ${c.label}`}
                    />
                  </span>
                ))}
              </div>
            }
          />
        ))}
      </div>
    </SettingsSectionCard>
  );
}
