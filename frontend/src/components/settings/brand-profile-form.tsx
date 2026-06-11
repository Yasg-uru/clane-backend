"use client";

import type { ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";
import { SettingsSectionCard } from "./settings-section-card";
import { ProfileIdentityHeader } from "./profile-identity-header";
import { ProfileSaveFooter } from "./profile-save-footer";
import { useUpdateProfile } from "@/hooks/settings/useSettings";
import { brandProfileSchema } from "@/schemas/settings.schema";
import type { SafeBrand } from "@/types";

type BrandProfileFormProps = { user: SafeBrand };

export function BrandProfileForm({ user }: BrandProfileFormProps): ReactElement {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm({
    defaultValues: {
      fullName: user.fullName,
      city: user.city,
      brandName: user.brandName,
      brandType: user.brandType,
    },
    validators: { onSubmit: brandProfileSchema },
    onSubmit: async ({ value }) => updateProfile(value),
  });

  const fields = [
    { name: "brandName" as const, label: "Brand name", placeholder: "Acme Co." },
    { name: "brandType" as const, label: "Brand type", placeholder: "e.g. D2C, Agency, SaaS" },
    { name: "fullName" as const, label: "Contact name", placeholder: "Your full name" },
    { name: "city" as const, label: "City", placeholder: "Mumbai" },
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
        title="Profile"
        description="This information is shown to creators who view your campaigns."
        footer={
          <form.Subscribe selector={(s) => [s.isSubmitting, s.isDirty] as const}>
            {([isSubmitting, isDirty]) => (
              <ProfileSaveFooter
                isDirty={isDirty}
                isBusy={isPending || isSubmitting}
                onDiscard={() => form.reset()}
              />
            )}
          </form.Subscribe>
        }
      >
        <ProfileIdentityHeader user={user} />

        <div className="grid gap-5 border-t border-border/50 pt-5 sm:grid-cols-2">
          {fields.map((f) => (
            <form.Field key={f.name} name={f.name}>
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{f.label}</Label>
                  <Input
                    id={field.name}
                    placeholder={f.placeholder}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          ))}
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-muted/40 px-3.5 py-3">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Manage your email and password from{" "}
            <span className="font-medium text-foreground">Account &amp; Security</span>.
          </p>
        </div>
      </SettingsSectionCard>
    </form>
  );
}
