import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GradientOrb } from "@/components/common/gradient-orb";
import { ROUTES } from "@/config/routes.config";

type AuthShellProps = {
  panel: ReactNode;
  children: ReactNode;
};

export function AuthShell({ panel, children }: AuthShellProps): ReactElement {
  return (
    <div className="flex min-h-screen">
      {/* ── Left: Branded panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[52%] xl:w-[55%] auth-panel-bg">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <GradientOrb color="from" className="-left-32 top-1/4 h-[520px] w-[520px] opacity-[0.13] blur-[130px] animate-pulse-glow dark:opacity-[0.26]" />
          <GradientOrb color="to"   className="-bottom-24 right-0 h-[420px] w-[420px] opacity-[0.09] blur-[100px] animate-pulse-glow delay-neg-2s dark:opacity-[0.20]" />
          <GradientOrb color="via"  className="right-1/4 top-1/3 h-[250px] w-[250px] opacity-[0.07] blur-[70px] dark:opacity-[0.14]" />
          <GradientOrb color="from" className="left-1/2 bottom-1/4 h-[200px] w-[200px] opacity-[0.06] blur-[60px] animate-pulse-glow delay-neg-1s dark:opacity-[0.12]" />
          <div className="absolute inset-0 opacity-[0.04] adaptive-grid-overlay dark:opacity-[0.05] dark:hero-grid-overlay" />
        </div>
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 xl:p-16">
          {panel}
        </div>
      </div>

      {/* ── Right: Form area ── */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
        {/* Ambient smoke — form side */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <GradientOrb color="from" className="-right-20 -top-10 h-[380px] w-[380px] opacity-[0.06] blur-[110px] animate-pulse-glow dark:opacity-[0.14]" />
          <GradientOrb color="to"   className="-bottom-16 left-1/4 h-[300px] w-[300px] opacity-[0.05] blur-[90px] animate-pulse-glow delay-neg-2s dark:opacity-[0.11]" />
          <GradientOrb color="via"  className="left-0 top-1/2 h-[200px] w-[200px] opacity-[0.04] blur-[70px] dark:opacity-[0.09]" />
        </div>

        {/* Mobile: back to home */}
        <div className="relative flex items-center justify-between border-b border-border/50 px-6 py-4 lg:hidden">
          <Link
            href={ROUTES.home}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
          <Link href={ROUTES.home} className="flex items-center gap-1 text-lg font-bold">
            <span className="text-gradient-ig">Creator</span>
            <span className="text-foreground">Lane</span>
          </Link>
        </div>

        {/* Form centered */}
        <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
