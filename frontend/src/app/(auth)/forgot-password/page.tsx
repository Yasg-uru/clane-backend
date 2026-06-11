import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPanelForgot } from "@/components/auth/auth-panel-forgot";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ROUTES } from "@/config/routes.config";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage(): ReactElement {
  return (
    <AuthShell panel={<AuthPanelForgot />}>
      <div className="space-y-7">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a secure reset link
          </p>
        </div>

        {/* Form card — gradient border */}
        <div className="ring-gradient-ig rounded-2xl shadow-lg shadow-ig-purple/10 dark:shadow-ig-purple/20">
          <div className="rounded-2xl bg-background/95 p-7 backdrop-blur-sm dark:bg-card/90">
            <ForgotPasswordForm />
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
    </AuthShell>
  );
}
