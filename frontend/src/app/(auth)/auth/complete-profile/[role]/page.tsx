"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/common/logo";
import { useCompleteSocialProfile } from "@/hooks/auth/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import {
  brandCompleteProfileSchema,
  creatorCompleteProfileSchema,
} from "@/schemas/auth.schema";
import { UserRole } from "@/types";
import { ROUTES } from "@/config/routes.config";

const BRAND_TYPES = [
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Food & Beverage",
  "Tech & Electronics",
  "Health & Wellness",
  "Travel & Hospitality",
  "Home & Lifestyle",
  "Finance & Fintech",
  "EdTech",
  "Other",
];

const NICHE_SUGGESTIONS = [
  "Fashion",
  "Beauty",
  "Fitness",
  "Food",
  "Travel",
  "Tech",
  "Finance",
  "Gaming",
  "Education",
  "Lifestyle",
  "Parenting",
  "Comedy",
];

type FieldErrorProps = { errors: unknown[] };

function FieldError({ errors }: FieldErrorProps): React.ReactElement | null {
  if (!errors.length) return null;
  return <p className="text-sm font-medium text-destructive">{String(errors[0])}</p>;
}

function BrandCompleteProfileForm({
  intermediateToken,
  role,
}: {
  intermediateToken: string;
  role: string;
}) {
  const { mutate: completeProfile, isPending } = useCompleteSocialProfile();

  const form = useForm({
    defaultValues: { brandName: "", brandType: "", city: "" },
    validators: { onSubmit: brandCompleteProfileSchema },
    onSubmit: async ({ value }) => {
      completeProfile({ role, data: value, intermediateToken });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="brandName">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Brand Name</Label>
            <Input
              id={field.name}
              placeholder="Nykaa, Lenskart…"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="brandType">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Brand Category</Label>
            <Input
              id={field.name}
              list="brand-types"
              placeholder="Fashion & Apparel"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <datalist id="brand-types">
              {BRAND_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
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
              placeholder="Mumbai"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full mt-2" disabled={isPending || isSubmitting}>
            {(isPending || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Profile
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

function CreatorCompleteProfileForm({
  intermediateToken,
  role,
}: {
  intermediateToken: string;
  role: string;
}) {
  const [nicheInput, setNicheInput] = useState("");
  const { mutate: completeProfile, isPending } = useCompleteSocialProfile();

  const form = useForm({
    defaultValues: {
      instagramHandle: "",
      instagramFollowers: 0,
      niche: [] as string[],
      city: "",
    },
    validators: { onSubmit: creatorCompleteProfileSchema },
    onSubmit: async ({ value }) => {
      completeProfile({ role, data: value, intermediateToken });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="instagramHandle">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Instagram Handle</Label>
              <Input
                id={field.name}
                placeholder="@arjun.creates"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="instagramFollowers">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Followers</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="25000"
                min={0}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="city">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>City</Label>
            <Input
              id={field.name}
              placeholder="Delhi"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

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
              <Label>Niches</Label>
              <p className="text-sm text-muted-foreground">
                Add at least one niche that describes your content.
              </p>
              <div className="flex flex-wrap gap-2">
                {niches.map((niche) => (
                  <Badge key={niche} variant="secondary" className="gap-1 pr-1">
                    {niche}
                    <button
                      type="button"
                      onClick={() => removeNiche(niche)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a niche and press Enter"
                  value={nicheInput}
                  list="niche-suggestions"
                  onChange={(e) => setNicheInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNiche(nicheInput);
                    }
                  }}
                />
                <datalist id="niche-suggestions">
                  {NICHE_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addNiche(nicheInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FieldError errors={field.state.meta.errors} />
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full mt-2" disabled={isPending || isSubmitting}>
            {(isPending || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Profile
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default function CompleteProfilePage() {
  const params = useParams<{ role: string }>();
  const router = useRouter();
  const intermediateToken = useAuthStore((s) => s.intermediateToken);

  const role = params.role;
  const isBrand = role === UserRole.BRAND;

  useEffect(() => {
    if (!intermediateToken) {
      router.replace(ROUTES.auth.login);
    }
  }, [intermediateToken, router]);

  if (!intermediateToken) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <Logo className="mx-auto justify-center" />

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete your profile</CardTitle>
            <CardDescription>
              {isBrand
                ? "Tell us a bit about your brand to get started."
                : "A few more details to set up your creator profile."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isBrand ? (
              <BrandCompleteProfileForm intermediateToken={intermediateToken} role={role} />
            ) : (
              <CreatorCompleteProfileForm intermediateToken={intermediateToken} role={role} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
