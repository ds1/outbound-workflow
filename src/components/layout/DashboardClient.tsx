"use client";

import { MinimizedJobs } from "@/components/MinimizedJobs";

export function DashboardClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MinimizedJobs />
    </>
  );
}
