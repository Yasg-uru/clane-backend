"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus, X, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";
import { SettingsSectionCard } from "./settings-section-card";
import { ProfileIdentityHeader } from "./profile-identity-header";
import { ProfileSaveFooter } from "./profile-save-footer";
import { useUpdateProfile } from "@/hooks/settings/useSettings";
import { creatorProfileSchema } from "@/schemas/settings.schema";
import { NICHE_SUGGESTIONS } from "@/config/creator.config";
import type { SafeCreator } from "@/types";

type CreatorProfileFormProps = { user: SafeCreator };

export function CreatorProfileForm({ user }: CreatorProfileFormProps): ReactElement {
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [nicheInput, setNicheInput] = useState("");

  const form = useForm({
    defaultValues: {
      fullName: user.fullName,
      city: user.city,
      niche: user.niche,
    },
    validators: { onSubmit: creatorProfileSchema },
    onSubmit: async ({ value }) => updateProfile(value),
  });

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
        description="This information is shown to brands you collaborate with."
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

        <div className="space-y-5 border-t border-border/50 pt-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="fullName">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Full name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="city">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>City</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="niche">
            {(field) => {
              const niches = field.state.value;

              function addNiche(value: string): void {
                const trimmed = value.trim();
                if (!trimmed || niches.includes(trimmed)) return;
                field.handleChange([...niches, trimmed]);
                setNicheInput("");
              }

              function removeNiche(niche: string): void {
                field.handleChange(niches.filter((n) => n !== niche));
              }

              return (
                <div className="space-y-2">
                  <Label>Content niches</Label>
                  <p className="text-xs text-muted-foreground">
                    Brands discover you through these. Add the topics you create about.
                  </p>
                  {niches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {niches.map((niche) => (
                        <Badge key={niche} variant="secondary" className="gap-1 rounded-full pr-1">
                          {niche}
                          <button
                            type="button"
                            onClick={() => removeNiche(niche)}
                            className="rounded-full p-0.5 hover:text-destructive"
                            aria-label={`Remove ${niche}`}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a niche and press Enter"
                      value={nicheInput}
                      list="settings-niche-suggestions"
                      onChange={(e) => setNicheInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addNiche(nicheInput);
                        }
                      }}
                    />
                    <datalist id="settings-niche-suggestions">
                      {NICHE_SUGGESTIONS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addNiche(nicheInput)}
                      aria-label="Add niche"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>

          <div className="flex items-start gap-2 rounded-xl bg-muted/40 px-3.5 py-3">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Follower and engagement metrics sync automatically from your connected social
              accounts. Manage your email from{" "}
              <span className="font-medium text-foreground">Account &amp; Security</span>.
            </p>
          </div>
        </div>
      </SettingsSectionCard>
    </form>
  );
}
