import type { ReactElement } from "react";
import Link from "next/link";
import { CheckCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";

const steps: string[] = [
  "Enter your email to receive a secure reset link",
  "Check your inbox — link expires in 15 minutes",
  "Choose a strong new password",
  "All active sessions are signed out automatically",
];

function SecurityCard(): ReactElement {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        "border border-border/60 bg-muted/40",
        "dark:border-white/10 dark:bg-white/[0.03]",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="ring-gradient-ig shrink-0 rounded-full">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-full",
              "bg-muted dark:bg-white/10",
            )}
          >
            <ShieldCheck className="size-5 text-ig-orange" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground dark:text-white">
            Protected by CreatorLane
          </p>
          <p className="text-[11px] text-muted-foreground dark:text-white/40">
            256-bit SSL encryption
          </p>
        </div>
      </div>

      {/* Feature list */}
      <div
        className={cn(
          "space-y-2.5 border-t px-4 py-3",
          "border-border/50 dark:border-white/8",
        )}
      >
        {["One-time use link", "Sessions invalidated on reset", "Social accounts unaffected"].map(
          (item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle className="size-3.5 shrink-0 text-ig-orange" />
              <span className="text-xs text-muted-foreground dark:text-white/50">{item}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function AuthPanelForgot(): ReactElement {
  return (
    <>
      {/* Logo */}
      <Link href={ROUTES.home} className="flex items-center gap-0.5 text-2xl font-bold">
        <span className="text-gradient-ig">Creator</span>
        <span className="text-foreground dark:text-white">Lane</span>
      </Link>

      {/* Main content */}
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40">
          Account Security
        </p>
        <h2 className="mb-5 text-4xl font-bold leading-[1.1] text-foreground dark:text-white xl:text-5xl">
          Reset your
          <br />
          <span className="text-gradient-ig">password safely.</span>
        </h2>
        <p className="max-w-sm leading-relaxed text-muted-foreground dark:text-white/50">
          Your account security is our priority. Follow the steps and you&apos;ll be back in
          minutes.
        </p>

        {/* Steps */}
        <ol className="mt-9 space-y-4">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  "bg-ig-orange/15 text-ig-orange",
                )}
              >
                {i + 1}
              </span>
              <span className="text-muted-foreground dark:text-white/60">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Security card */}
      <SecurityCard />
    </>
  );
}
