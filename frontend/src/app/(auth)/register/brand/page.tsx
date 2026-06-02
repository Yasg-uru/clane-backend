import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPanelBrand } from "@/components/auth/auth-panel-brand";
import { RegisterBrandForm } from "@/components/auth/register-brand-form";
import { ROUTES } from "@/config/routes.config";

export const metadata: Metadata = { title: "Register as Brand" };

export default function RegisterBrandPage(): ReactElement {
  return (
    <AuthShell panel={<AuthPanelBrand />}>
      <div className="space-y-7">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create your brand account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Start connecting with India&apos;s top verified creators
          </p>
        </div>

        {/* Form card — gradient border */}
        <div className="ring-gradient-ig rounded-2xl shadow-lg shadow-ig-purple/10 dark:shadow-ig-purple/20">
          <div className="rounded-2xl bg-background/95 p-7 backdrop-blur-sm dark:bg-card/90">
            <RegisterBrandForm />
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
            Are you a creator?{" "}
            <Link
              href={ROUTES.auth.registerCreator}
              className="font-semibold text-foreground hover:underline"
            >
              Register as Creator
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
