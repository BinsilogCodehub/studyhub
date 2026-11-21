"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/subjects": "Subjects",
  "/assignments": "Assignments",
  "/reminders": "Reminders",
  "/settings": "Settings",
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);


  const title = titles[pathname] ?? "StudyHub";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar pathname={pathname} />
      <MobileNavigation open={menuOpen} pathname={pathname} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-64">
        <Header title={title} onMenuClick={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
