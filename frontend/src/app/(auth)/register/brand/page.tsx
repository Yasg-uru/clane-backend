import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterBrandForm } from "@/components/auth/register-brand-form";
import { Logo } from "@/components/common/logo";
import { ROUTES } from "@/config/routes.config";

export const metadata: Metadata = { title: "Register as Brand" };

export default function RegisterBrandPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <Logo className="mx-auto justify-center" />

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your brand account</CardTitle>
            <CardDescription>
              Start connecting with India&apos;s top creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterBrandForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href={ROUTES.auth.login} className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Are you a creator?{" "}
              <Link
                href={ROUTES.auth.registerCreator}
                className="font-medium text-primary hover:underline"
              >
                Register as Creator
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
