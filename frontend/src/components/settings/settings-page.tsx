"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { GradientOrb } from "@/components/common/gradient-orb";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsNav } from "./settings-nav";
import { ProfileSettings } from "./profile-settings";
import { AccountSettings } from "./account-settings";
import { ConnectionsSettings } from "./connections-settings";
import { NotificationSettings } from "./notification-settings";
import { AppearanceSettings } from "./appearance-settings";
import { DangerZoneSettings } from "./danger-zone-settings";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { SettingsSection } from "@/types/settings.types";
import type { SafeUser } from "@/types";

export function SettingsPage(): ReactElement {
  const user = useCurrentUser();
  const [active, setActive] = useState<SettingsSection>(SettingsSection.PROFILE);

  return (
    <div className="relative space-y-8">
      {/* Ambient orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-24 h-[500px] w-[500px] opacity-[0.05] blur-[130px]" />
        <GradientOrb color="to" className="-bottom-32 right-0 h-[400px] w-[400px] opacity-[0.04] blur-[110px]" />
      </div>

      {/* Header */}
      <header className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-ig text-white">
          <SettingsIcon className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, security and preferences.
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SettingsNav active={active} onSelect={setActive} />
        </aside>

        <div className="min-w-0">
          {user ? (
            <SettingsContent section={active} user={user} />
          ) : (
            <SettingsSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}

type SettingsContentProps = { section: SettingsSection; user: SafeUser };

function SettingsContent({ section, user }: SettingsContentProps): ReactElement {
  switch (section) {
    case SettingsSection.PROFILE:
      return <ProfileSettings user={user} />;
    case SettingsSection.ACCOUNT:
      return <AccountSettings user={user} />;
    case SettingsSection.CONNECTIONS:
      return <ConnectionsSettings user={user} />;
    case SettingsSection.NOTIFICATIONS:
      return <NotificationSettings />;
    case SettingsSection.APPEARANCE:
      return <AppearanceSettings />;
    case SettingsSection.DANGER:
      return <DangerZoneSettings />;
    default:
      return <ProfileSettings user={user} />;
  }
}

function SettingsSkeleton(): ReactElement {
  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-56 rounded" />
        </div>
      </div>
      <div className="grid gap-5 pt-4 sm:grid-cols-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );
}
