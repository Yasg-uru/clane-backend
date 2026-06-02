import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPanelLogin } from "@/components/auth/auth-panel-login";
import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/config/routes.config";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage(): ReactElement {
  return (
    <AuthShell panel={<AuthPanelLogin />}>
      <div className="space-y-7">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your CreatorLane account
          </p>
        </div>

        {/* Form card — gradient border */}
        <div className="ring-gradient-ig rounded-2xl shadow-lg shadow-ig-purple/10 dark:shadow-ig-purple/20">
          <div className="rounded-2xl bg-background/95 p-7 backdrop-blur-sm dark:bg-card/90">
            <LoginForm />
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.auth.registerBrand}
            className="font-semibold text-foreground hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
