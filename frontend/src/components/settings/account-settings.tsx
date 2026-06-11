"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2, MailCheck, MailWarning, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/auth/field-error";
import { SettingsSectionCard } from "./settings-section-card";
import { useChangePassword } from "@/hooks/settings/useSettings";
import { changePasswordSchema } from "@/schemas/settings.schema";
import type { SafeUser } from "@/types";

type AccountSettingsProps = { user: SafeUser };

export function AccountSettings({ user }: AccountSettingsProps): ReactElement {
  return (
    <div className="space-y-6">
      <EmailCard user={user} />
      <PasswordCard />
    </div>
  );
}

function EmailCard({ user }: { user: SafeUser }): ReactElement {
  return (
    <SettingsSectionCard
      title="Email address"
      description="Used for sign-in, receipts and account notifications."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Changing your email requires re-verification.
          </p>
        </div>
        {user.isEmailVerified ? (
          <Badge className="gap-1 rounded-full border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MailCheck className="size-3" />
            Verified
          </Badge>
        ) : (
          <Badge className="gap-1 rounded-full border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <MailWarning className="size-3" />
            Unverified
          </Badge>
        )}
      </div>
    </SettingsSectionCard>
  );
}

function PasswordCard(): ReactElement {
  const { mutate: changePassword, isPending } = useChangePassword();
  const [show, setShow] = useState<Record<"current" | "next" | "confirm", boolean>>({
    current: false,
    next: false,
    confirm: false,
  });

  const form = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      changePassword(value, { onSuccess: () => form.reset() });
    },
  });

  const fields = [
    { name: "currentPassword" as const, label: "Current password", key: "current" as const, autoComplete: "current-password" },
    { name: "newPassword" as const, label: "New password", key: "next" as const, autoComplete: "new-password" },
    { name: "confirmPassword" as const, label: "Confirm new password", key: "confirm" as const, autoComplete: "new-password" },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <SettingsSectionCard
        title="Password"
        icon={KeyRound}
        description="Use a strong password you don't reuse elsewhere."
        footer={
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                size="sm"
                disabled={isPending || isSubmitting}
              >
                {(isPending || isSubmitting) && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Update password
              </Button>
            )}
          </form.Subscribe>
        }
      >
        <div className="grid max-w-md gap-4">
          {fields.map((f) => (
            <form.Field key={f.name} name={f.name}>
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{f.label}</Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={show[f.key] ? "text" : "password"}
                      autoComplete={f.autoComplete}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 size-7 -translate-y-1/2 p-0"
                      onClick={() =>
                        setShow((p) => ({ ...p, [f.key]: !p[f.key] }))
                      }
                      aria-label={show[f.key] ? "Hide password" : "Show password"}
                    >
                      {show[f.key] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          ))}
        </div>
      </SettingsSectionCard>
    </form>
  );
}
