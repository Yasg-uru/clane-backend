"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  CreditCard,
  Compass,
  Gavel,
  Wallet,
  Menu,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { GradientThemePicker } from "@/components/common/gradient-theme-picker";
import { NavUserMenu } from "@/components/layout/nav-user-menu";
import { NavMobileDrawer } from "@/components/layout/nav-mobile-drawer";
import type { NavItem } from "@/components/layout/nav-mobile-drawer";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { useLogout } from "@/hooks/auth/useAuth";
import { UserRole } from "@/types";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

const BRAND_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.brand.dashboard, icon: <LayoutDashboard className="size-4" /> },
  { label: "Campaigns", href: ROUTES.brand.campaigns, icon: <Megaphone className="size-4" /> },
  { label: "Creators", href: ROUTES.brand.creators, icon: <Users className="size-4" /> },
  { label: "Collabs", href: ROUTES.brand.collabs, icon: <Handshake className="size-4" /> },
  { label: "Payments", href: ROUTES.brand.payments, icon: <CreditCard className="size-4" /> },
];

const CREATOR_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.creator.dashboard, icon: <LayoutDashboard className="size-4" /> },
  { label: "Discover", href: ROUTES.creator.discover, icon: <Compass className="size-4" /> },
  { label: "My Bids", href: ROUTES.creator.bids, icon: <Gavel className="size-4" /> },
  { label: "Collabs", href: ROUTES.creator.collabs, icon: <Handshake className="size-4" /> },
  { label: "Earnings", href: ROUTES.creator.earnings, icon: <Wallet className="size-4" /> },
];

export function DashboardNavbar(): ReactElement {
  const user = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isBrand = user?.role === UserRole.BRAND;
  const navItems = isBrand ? BRAND_NAV : CREATOR_NAV;

  const displayName = user
    ? isBrand
      ? (user as import("@/types").SafeBrand).brandName
      : user.fullName
    : "";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const avatarUrl =
    user && "instagramProfilePicUrl" in user ? user.instagramProfilePicUrl : undefined;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-1 text-lg font-bold">
            <span className="text-gradient-ig">Creator</span>
            <span className="text-foreground">Lane</span>
          </Link>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <GradientThemePicker />
            <ThemeToggle />

            <NavUserMenu
              displayName={displayName}
              email={user?.email}
              initials={initials}
              avatarUrl={avatarUrl}
              isBrand={isBrand}
              isLoggingOut={isLoggingOut}
              onLogout={() => logout()}
            />

            <button
              type="button"
              className="md:hidden flex items-center justify-center size-9 rounded-lg border border-border/60 bg-card/80 hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-4.5" />
            </button>
          </div>
        </div>
      </header>

      <NavMobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        pathname={pathname}
        displayName={displayName}
        email={user?.email}
        initials={initials}
        avatarUrl={avatarUrl}
        isBrand={isBrand}
        isLoggingOut={isLoggingOut}
        onLogout={() => logout()}
      />
    </>
  );
}
