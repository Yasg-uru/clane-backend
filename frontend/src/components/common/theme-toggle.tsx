"use client";

import type { ReactElement } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle(): ReactElement {
  const { theme, setTheme } = useTheme();

  function handleToggle(): void {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle theme"
      className={cn(
        "relative flex size-8 items-center justify-center rounded-lg transition-all",
        "text-muted-foreground hover:text-foreground hover:bg-muted/80",
        "dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
      )}
    >
      <Sun className="size-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
