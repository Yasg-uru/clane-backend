"use client";

import type { ReactElement } from "react";
import { SETTINGS_NAV } from "@/config/settings.config";
import type { SettingsSection } from "@/types/settings.types";
import { cn } from "@/lib/utils";

type SettingsNavProps = {
  active: SettingsSection;
  onSelect: (section: SettingsSection) => void;
};

export function SettingsNav({ active, onSelect }: SettingsNavProps): ReactElement {
  return (
    <nav aria-label="Settings sections">
      {/* Mobile — horizontal scroll of pills */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SETTINGS_NAV.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? item.destructive
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-transparent bg-foreground text-background"
                  : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Desktop — vertical rail */}
      <ul className="hidden lg:flex lg:flex-col lg:gap-1">
        {SETTINGS_NAV.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-accent"
                    : "hover:bg-accent/60",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? item.destructive
                        ? "bg-destructive/10 text-destructive"
                        : "bg-gradient-ig text-white"
                      : "bg-muted text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium leading-tight",
                      isActive
                        ? item.destructive
                          ? "text-destructive"
                          : "text-foreground"
                        : "text-foreground/90",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
