"use client";

import { Suspense } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPanelForgot } from "@/components/auth/auth-panel-forgot";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ROUTES } from "@/config/routes.config";

function ResetPasswordContent(): ReactElement {
  const params = useSearchParams();
  const token = params.get("token");
  const role = params.get("role");

  if (!token || !role) {
    return (
      <div className="space-y-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invalid reset link</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            This link is missing required parameters
          </p>
        </div>

        <div className="ring-gradient-ig rounded-2xl shadow-lg shadow-ig-purple/10 dark:shadow-ig-purple/20">
          <div className="rounded-2xl bg-background/95 p-7 backdrop-blur-sm dark:bg-card/90">
            <div className="flex flex-col items-center gap-4 text-center py-2">
              <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-7 text-destructive" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Reset link is invalid</p>
                <p className="text-sm text-muted-foreground">
                  This link may have expired or already been used. Request a new one below.
                </p>
              </div>
              <Link
                href={ROUTES.auth.forgotPassword}
                className="inline-flex h-9 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white bg-gradient-ig hover:opacity-90 transition-opacity"
              >
                Request new link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a strong password — you&apos;ll be signed out of all devices
        </p>
      </div>

      {/* Form card — gradient border */}
      <div className="ring-gradient-ig rounded-2xl shadow-lg shadow-ig-purple/10 dark:shadow-ig-purple/20">
        <div className="rounded-2xl bg-background/95 p-7 backdrop-blur-sm dark:bg-card/90">
          <ResetPasswordForm token={token} role={role} />
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href={ROUTES.auth.login} className="font-semibold text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage(): ReactElement {
  return (
    <AuthShell panel={<AuthPanelForgot />}>
      <Suspense>
        <ResetPasswordContent />
      </Suspense>
    </AuthShell>
  );
}
