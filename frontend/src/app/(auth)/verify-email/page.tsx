"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";
import { useVerifyOtp, useResendOtp } from "@/hooks/auth/useAuth";
import { UserRole } from "@/types";
import { ROUTES } from "@/config/routes.config";
import { Mail } from "lucide-react";

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
    <div className="dark flex min-h-screen items-center justify-center bg-hero-bg px-4 py-12">
      {/* Background blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-ig-purple/20 blur-[100px] animate-pulse-glow" />
        <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-ig-orange/15 blur-[80px] animate-pulse-glow delay-neg-2s" />
        <div className="absolute inset-0 opacity-[0.04] hero-grid-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <Link href={ROUTES.home} className="inline-flex items-center gap-1 text-2xl font-bold">
          <span className="text-gradient-ig">Creator</span>
          <span className="text-white">Lane</span>
        </Link>

        {/* Icon */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl ring-gradient-ig p-[2px]">
          <div className="flex size-full items-center justify-center rounded-2xl bg-hero-surface">
            <Mail className="size-7 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-2 text-sm text-white/50">
            We sent a 6-digit OTP to{" "}
            <span className="font-semibold text-white/80">{email || "your email"}</span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 glass">
          <div className="flex flex-col items-center gap-6">
            <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />

            <Button
              onClick={handleSubmit}
              disabled={otp.length !== 6 || isVerifying}
              className="w-full bg-gradient-ig text-white border-transparent hover:opacity-90"
            >
              {isVerifying ? "Verifying…" : "Verify Email"}
            </Button>

            <p className="text-sm text-white/40">
              Didn&apos;t receive it?{" "}
              {cooldown > 0 ? (
                <span className="text-white/50">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-semibold text-ig-orange hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.auth.login}
          className="inline-block text-sm text-white/35 hover:text-white/60"
        >
          &larr; Back to sign in
        </Link>
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
