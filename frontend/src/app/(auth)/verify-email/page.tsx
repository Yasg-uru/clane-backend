"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { OtpInput } from "@/components/auth/otp-input";
import { useVerifyOtp, useResendOtp } from "@/hooks/auth/useAuth";
import { UserRole } from "@/types";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const role = (params.get("role") ?? UserRole.BRAND) as UserRole;

  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = useCallback(() => {
    if (otp.length !== 6) return;
    verifyOtp({ email, otp, role });
  }, [otp, email, role, verifyOtp]);

  const handleResend = useCallback(() => {
    resendOtp({ email, role });
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, [email, role, resendOtp]);

  useEffect(() => {
    if (otp.length === 6) handleSubmit();
  }, [otp, handleSubmit]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <Logo className="mx-auto justify-center" />

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a 6-digit OTP to{" "}
              <span className="font-medium text-foreground">{email || "your email"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? "Verifying…" : "Verify Email"}
            </Button>

            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive it?{" "}
              {cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
