"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Settings, LogOut, Loader2, ChevronDown, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ROUTES } from "@/config/routes.config";

type NavUserMenuProps = {
  displayName: string;
  email?: string;
  initials: string;
  avatarUrl?: string;
  isBrand: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function NavUserMenu({
  displayName,
  email,
  initials,
  avatarUrl,
  isBrand,
  isLoggingOut,
  onLogout,
}: NavUserMenuProps): ReactElement {
  return (
    <Popover>
      <PopoverTrigger className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent cursor-pointer">
        <div className="ring-gradient-ig rounded-full p-[1.5px]">
          <Avatar className="size-6">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <span className="max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent className="w-52 p-2" align="end" sideOffset={8}>
        <div className="px-2 py-2">
          <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{email}</p>
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
          onClick={onLogout}
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
  );
}
