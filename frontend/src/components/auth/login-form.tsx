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
import { FieldError } from "@/components/auth/field-error";
import { GoogleIcon, InstagramIcon } from "@/components/auth/icons";
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
