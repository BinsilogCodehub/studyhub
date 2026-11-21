"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, LayoutDashboard, ListChecks, Settings, X } from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Assignments", href: "/assignments", icon: ListChecks },
  { label: "Reminders", href: "/reminders", icon: CalendarDays },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface MobileNavigationProps {
  open: boolean;
  pathname: string;
  onClose: () => void;
}

export function MobileNavigation({ open, pathname, onClose }: MobileNavigationProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--navy)]/35"
        onClick={onClose}
        aria-label="Close navigation menu"
      />
      <aside className="absolute inset-y-0 left-0 w-[min(18rem,calc(100%-3rem))] bg-white shadow-xl">
        <div className="flex h-20 items-center justify-between border-b border-[var(--border)] px-5">
          <Link href="/" onClick={onClose} className="flex items-center gap-3" aria-label="StudyHub home">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--navy)] text-white">
              <BookOpen size={21} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight text-[var(--navy)]">StudyHub</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg text-[var(--secondary-text)] hover:bg-[var(--background)]"
            aria-label="Close navigation menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav className="space-y-1 p-4" aria-label="Mobile navigation">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold ${
                  active
                    ? "bg-[#EEF4FF] text-[var(--accent)]"
                    : "text-[var(--secondary-text)] hover:bg-[var(--background)] hover:text-[var(--primary-text)]"
                }`}
              >
                <Icon size={19} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
