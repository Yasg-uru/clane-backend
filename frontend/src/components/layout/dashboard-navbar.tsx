"use client";

import type { ReactElement } from "react";
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
  UserCircle,
  LogOut,
  ChevronDown,
  Settings,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { useLogout } from "@/hooks/auth/useAuth";
import { UserRole } from "@/types";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: ReactElement;
};

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
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-1 text-lg font-bold">
          <span className="text-gradient-ig">Creator</span>
          <span className="text-foreground">Lane</span>
        </Link>

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* Nav links */}
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

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {/* User menu */}
          <Popover>
            <PopoverTrigger className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent cursor-pointer">
              <div className="ring-gradient-ig rounded-full p-[1.5px]">
                <Avatar className="size-6">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="text-[10px] bg-muted">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="hidden sm:block max-w-[120px] truncate">{displayName}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2" align="end" sideOffset={8}>
              <div className="px-2 py-2">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Separator className="my-1" />
              <Link
                href={isBrand ? ROUTES.brand.settings : ROUTES.creator.settings}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Settings className="size-3.5" />
                Settings
              </Link>
              <Link
                href={isBrand ? ROUTES.brand.settings : ROUTES.creator.portfolio}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <UserCircle className="size-3.5" />
                {isBrand ? "Brand Profile" : "Portfolio"}
              </Link>
              <Separator className="my-1" />
              <button
                type="button"
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                {isLoggingOut ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <LogOut className="size-3.5" />
                )}
                Sign out
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
