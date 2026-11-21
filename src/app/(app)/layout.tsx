import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StudyDataProvider } from "@/providers/StudyDataProvider";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <StudyDataProvider>
      <AppShell>{children}</AppShell>
    </StudyDataProvider>
  );
}
