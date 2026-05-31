"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/logo";
import { useSubmitInstagramEmail } from "@/hooks/auth/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { submitInstagramEmailSchema } from "@/schemas/auth.schema";
import { ROUTES } from "@/config/routes.config";

type FieldErrorProps = { errors: unknown[] };

function FieldError({ errors }: FieldErrorProps): React.ReactElement | null {
  if (!errors.length) return null;
  return <p className="text-sm font-medium text-destructive">{String(errors[0])}</p>;
}

export default function InstagramEmailPage() {
  const params = useParams<{ role: string }>();
  const router = useRouter();
  const intermediateToken = useAuthStore((s) => s.intermediateToken);
  const { mutate: submitEmail, isPending } = useSubmitInstagramEmail();

  const role = params.role;

  useEffect(() => {
    if (!intermediateToken) {
      router.replace(ROUTES.auth.login);
    }
  }, [intermediateToken, router]);

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: submitInstagramEmailSchema },
    onSubmit: async ({ value }) => {
      if (!intermediateToken) return;
      submitEmail({ role, data: value, intermediateToken });
    },
  });

  if (!intermediateToken) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <Logo className="mx-auto justify-center" />

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Add your email</CardTitle>
            <CardDescription>
              Instagram didn&apos;t share your email address. Please provide one so we can verify
              your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Email address</Label>
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

              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending || isSubmitting}
                  >
                    {(isPending || isSubmitting) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Continue
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
