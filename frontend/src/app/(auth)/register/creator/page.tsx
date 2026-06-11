import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPanelCreator } from "@/components/auth/auth-panel-creator";
import { RegisterCreatorForm } from "@/components/auth/register-creator-form";
import { ROUTES } from "@/config/routes.config";

export const metadata: Metadata = { title: "Register as Creator" };

export default function RegisterCreatorPage(): ReactElement {
  return (
    <AuthShell panel={<AuthPanelCreator />}>
      <div className="space-y-7">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Join as a Creator</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Discover brand campaigns and grow your earning potential
          </p>
        </div>

        {/* Form card — gradient border */}
        <div className="ring-gradient-ig rounded-2xl shadow-lg shadow-ig-purple/10 dark:shadow-ig-purple/20">
          <div className="rounded-2xl bg-background/95 p-7 backdrop-blur-sm dark:bg-card/90">
            <RegisterCreatorForm />
          </div>
        </div>

        {/* Footer links */}
        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link href={ROUTES.auth.login} className="font-semibold text-foreground hover:underline">
              Sign in
            </Link>
          </p>
          <p>
            Are you a brand?{" "}
            <Link
              href={ROUTES.auth.registerBrand}
              className="font-semibold text-foreground hover:underline"
            >
              Register as Brand
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
