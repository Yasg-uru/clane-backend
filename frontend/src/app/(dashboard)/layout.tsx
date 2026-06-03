import type { ReactNode } from "react";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
