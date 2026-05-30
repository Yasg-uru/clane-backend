import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterCreatorForm } from "@/components/auth/register-creator-form";
import { Logo } from "@/components/common/logo";
import { ROUTES } from "@/config/routes.config";

export const metadata: Metadata = { title: "Register as Creator" };

export default function RegisterCreatorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <Logo className="mx-auto justify-center" />

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join as a Creator</CardTitle>
            <CardDescription>
              Discover brand campaigns and grow your influence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterCreatorForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href={ROUTES.auth.login} className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Are you a brand?{" "}
              <Link
                href={ROUTES.auth.registerBrand}
                className="font-medium text-primary hover:underline"
              >
                Register as Brand
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
