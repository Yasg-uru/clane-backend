"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogin, useInitiateSocialAuth } from "@/hooks/auth/useAuth";
import { loginSchema } from "@/schemas/auth.schema";
import { ROLE_LABELS } from "@/config/roles.config";
import { ROUTES } from "@/config/routes.config";
import { SocialProvider, UserRole } from "@/types";

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

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="white" />
    </svg>
  );
}

export function LoginForm(): React.ReactElement {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();
  const { mutate: initiateSocialAuth, isPending: isSocialPending } = useInitiateSocialAuth();

  const form = useForm({
    defaultValues: { email: "", password: "", role: UserRole.BRAND as UserRole },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => login(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-5"
    >
      <form.Field name="role">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>I am a</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v as UserRole)}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              type="email"
              placeholder="you@example.com"
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
            <div className="flex items-center justify-between">
              <Label htmlFor={field.name}>Password</Label>
              <Link
                href={ROUTES.auth.forgotPassword}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id={field.name}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
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

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            className="w-full bg-gradient-ig text-white border-transparent hover:opacity-90"
            disabled={isPending || isSubmitting}
          >
            {(isPending || isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign in
          </Button>
        )}
      </form.Subscribe>

      <form.Subscribe selector={(s) => s.values.role}>
        {(role) => (
          <>
            <div className="relative flex items-center gap-3 py-1">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Or continue with
              </span>
              <Separator className="flex-1" />
            </div>

            {role === UserRole.BRAND ? (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-border/70 hover:bg-muted/50"
                disabled={isSocialPending}
                onClick={() =>
                  initiateSocialAuth({ role: UserRole.BRAND, provider: SocialProvider.GOOGLE })
                }
              >
                {isSocialPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full gap-2 bg-gradient-ig text-white border-transparent hover:opacity-90"
                disabled={isSocialPending}
                onClick={() =>
                  initiateSocialAuth({
                    role: UserRole.CREATOR,
                    provider: SocialProvider.INSTAGRAM,
                  })
                }
              >
                {isSocialPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <InstagramIcon />
                )}
                Continue with Instagram
              </Button>
            )}
          </>
        )}
      </form.Subscribe>
    </form>
  );
}
