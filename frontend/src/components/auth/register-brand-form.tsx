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

type FieldErrorProps = { errors: unknown[] };

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error !== null && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function FieldError({ errors }: FieldErrorProps): React.ReactElement | null {
  if (!errors.length) return null;
  return (
    <p className="text-sm font-medium text-destructive">{extractErrorMessage(errors[0])}</p>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

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
