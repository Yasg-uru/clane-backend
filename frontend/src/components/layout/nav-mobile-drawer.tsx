"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Settings, LogOut, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactElement;
};

type NavMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  pathname: string;
  displayName: string;
  email?: string;
  initials: string;
  avatarUrl?: string;
  isBrand: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function NavMobileDrawer({
  open,
  onClose,
  navItems,
  pathname,
  displayName,
  email,
  initials,
  avatarUrl,
  isBrand,
  isLoggingOut,
  onLogout,
}: NavMobileDrawerProps): ReactElement {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden transition-all duration-300",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-72 bg-background border-r border-border/60 flex flex-col shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border/50 shrink-0">
          <span className="text-lg font-bold">
            <span className="text-gradient-ig">Creator</span>
            <span className="text-foreground">Lane</span>
          </span>
          <button
            type="button"
            className="flex items-center justify-center size-8 rounded-lg hover:bg-accent transition-colors"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className={cn("size-4", isActive && "text-foreground")}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border/50 p-3 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="ring-gradient-ig rounded-full p-[1.5px] shrink-0">
              <Avatar className="size-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>
          </div>
          <Link
            href={isBrand ? ROUTES.brand.settings : ROUTES.creator.settings}
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Settings className="size-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
