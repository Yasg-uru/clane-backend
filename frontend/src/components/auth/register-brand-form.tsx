"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRegisterBrand, useInitiateSocialAuth } from "@/hooks/auth/useAuth";
import { brandRegisterSchema } from "@/schemas/auth.schema";
import { SocialProvider, UserRole } from "@/types";
import { FieldError } from "@/components/auth/field-error";
import { GoogleIcon, InstagramIcon } from "@/components/auth/icons";

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

export function RegisterBrandForm(): React.ReactElement {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: registerBrand, isPending } = useRegisterBrand();
  const { mutate: initiateSocialAuth, isPending: isSocialPending } = useInitiateSocialAuth();

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      city: "",
      brandName: "",
      brandType: "",
      instagramHandle: "",
    },
    validators: { onSubmit: brandRegisterSchema },
    onSubmit: async ({ value }) => registerBrand(value),
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
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        disabled={isSocialPending}
        onClick={() =>
          initiateSocialAuth({ role: UserRole.BRAND, provider: SocialProvider.GOOGLE })
        }
      >
        {isSocialPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Sign up with Google
      </Button>

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">Or sign up with email</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="fullName">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Full Name</Label>
              <Input
                id={field.name}
                placeholder="Riya Sharma"
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
                placeholder="Mumbai"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Work Email</Label>
            <Input
              id={field.name}
              type="email"
              placeholder="riya@brand.com"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Password</Label>
            <div className="relative">
              <Input
                id={field.name}
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, uppercase, number, symbol"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <form.Field name="instagramHandle">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Instagram Handle{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id={field.name}
              placeholder="@yourbrand"
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
          <Button
            type="submit"
            className="mt-2 w-full bg-gradient-ig text-white border-transparent hover:opacity-90"
            disabled={isPending || isSubmitting}
          >
            {(isPending || isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Brand Account
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
