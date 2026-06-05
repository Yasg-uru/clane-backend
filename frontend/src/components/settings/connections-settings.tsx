"use client";

import type { ReactElement } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSectionCard } from "./settings-section-card";
import {
  useConnectSocialAccount,
  useDisconnectSocial,
} from "@/hooks/settings/useSettings";
import { CONNECTION_PROVIDERS } from "@/config/settings.config";
import { isProviderConnected, providerConnectionDetail } from "@/lib/connection-status";
import { cn } from "@/lib/utils";
import { SocialProvider, type SafeUser } from "@/types";

type ConnectionsSettingsProps = { user: SafeUser };

export function ConnectionsSettings({ user }: ConnectionsSettingsProps): ReactElement {
  const { mutate: connect, isPending: isConnecting, variables: connectingVars } =
    useConnectSocialAccount();
  const { mutate: disconnect, isPending: isDisconnecting, variables: disconnectingProvider } =
    useDisconnectSocial();

  const providers = CONNECTION_PROVIDERS.filter((p) => p.roles.includes(user.role));

  return (
    <SettingsSectionCard
      title="Connected accounts"
      description="Link your social platforms to verify your audience and unlock collabs."
    >
      <ul className="divide-y divide-border/50">
        {providers.map((p) => {
          const connected = isProviderConnected(user, p.provider);
          // Instagram is a creator's core identity and cannot be unlinked here.
          const canDisconnect = connected && p.provider !== SocialProvider.INSTAGRAM;
          const busyConnect = isConnecting && connectingVars?.provider === p.provider;
          const busyDisconnect = isDisconnecting && disconnectingProvider === p.provider;

          return (
            <li key={p.provider} className="flex items-center gap-4 py-4 first:pt-1 last:pb-1">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  p.accent,
                )}
              >
                <p.icon className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{p.label}</p>
                  {connected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="size-2.5" strokeWidth={3} />
                      {providerConnectionDetail(user, p.provider)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
              </div>

              {canDisconnect ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busyDisconnect}
                  onClick={() => disconnect(p.provider)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  {busyDisconnect && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                  Disconnect
                </Button>
              ) : connected ? (
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  Primary
                </span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busyConnect}
                  onClick={() => connect({ role: user.role, provider: p.provider })}
                  className="shrink-0"
                >
                  {busyConnect ? (
                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                  ) : (
                    <Plus className="mr-1.5 size-3.5" />
                  )}
                  Connect
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </SettingsSectionCard>
  );
}
