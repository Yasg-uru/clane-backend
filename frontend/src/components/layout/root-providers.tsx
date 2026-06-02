"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { createQueryClient } from "@/lib/query/query-client";
import { useSessionHydration } from "@/hooks/auth/useSession";
import { GradientThemeInjector } from "@/components/common/gradient-theme-injector";

function SessionHydrator() {
  useSessionHydration();
  return null;
}

export function RootProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <GradientThemeInjector />
        <SessionHydrator />
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
