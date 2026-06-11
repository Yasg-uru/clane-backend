import type { ReactElement } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { GradientThemePicker } from "@/components/common/gradient-theme-picker";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

const navLinks = [
  ["How it works", "#how-it-works"],
  ["Features", "#features"],
  ["Stories", "#testimonials"],
] as const;

export function LandingNavbar(): ReactElement {
  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Rotating gradient border wrapper */}
        <div
          className={cn(
            "absolute inset-x-4 top-3 h-12 overflow-hidden rounded-2xl p-px",
            "shadow-sm dark:shadow-black/30",
          )}
        >
          {/* Spinning conic gradient — creates the sweeping border illusion */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="navbar-spin-gradient animate-spin-slow aspect-square w-[250%]" />
          </div>

          {/* Actual glass pill — covers center, reveals 1px gradient border */}
          <div
            className={cn(
              "relative flex h-full items-center justify-between rounded-2xl px-5",
              "bg-background/90 backdrop-blur-xl",
              "dark:bg-white/5",
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-0.5 text-lg font-bold">
              <span className="text-gradient-ig">Creator</span>
              <span className="text-foreground dark:text-white">Lane</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className={cn(
                    "text-sm transition-colors",
                    "text-muted-foreground hover:text-foreground",
                    "dark:text-white/60 dark:hover:text-white",
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <GradientThemePicker />
              <ThemeToggle />
              <Link
                href={ROUTES.auth.login}
                className={cn(
                  "hidden px-4 py-1.5 text-sm font-medium transition-colors sm:block",
                  "text-muted-foreground hover:text-foreground",
                  "dark:text-white/70 dark:hover:text-white",
                )}
              >
                Sign in
              </Link>
              <Link
                href={ROUTES.auth.registerBrand}
                className="inline-flex h-7 items-center justify-center rounded-xl px-4 text-xs font-semibold text-white bg-gradient-ig transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
