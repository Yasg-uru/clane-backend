"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForgotPassword } from "@/hooks/auth/useAuth";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { ROLE_LABELS } from "@/config/roles.config";
import { ROUTES } from "@/config/routes.config";
import { UserRole } from "@/types";
import { FieldError } from "@/components/auth/field-error";

export function ForgotPasswordForm(): React.ReactElement {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const form = useForm({
    defaultValues: { email: "", role: UserRole.BRAND as UserRole },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      forgotPassword(value, {
        onSuccess: () => setSubmittedEmail(value.email),
      });
    },
  });

  if (submittedEmail) {
    return (
      <div className="space-y-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl ring-gradient-ig p-[2px]">
          <div className="flex size-full items-center justify-center rounded-2xl bg-muted dark:bg-white/5">
            <Mail className="size-7 text-ig-orange" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">Check your inbox</h3>
          <p className="text-sm text-muted-foreground">
            If{" "}
            <span className="font-semibold text-foreground">{submittedEmail}</span>{" "}
            is registered, we sent a reset link. It expires in 15 minutes.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full border-border/70"
            onClick={() => setSubmittedEmail(null)}
          >
            Try a different email
          </Button>
          <Link
            href={ROUTES.auth.login}
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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
            <Label htmlFor={field.name}>Email address</Label>
            <Input
              id={field.name}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
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
            className="w-full bg-gradient-ig text-white border-transparent hover:opacity-90"
            disabled={isPending || isSubmitting}
          >
            {isPending || isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        )}
      </form.Subscribe>

      <Link
        href={ROUTES.auth.login}
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </form>
  );
}
