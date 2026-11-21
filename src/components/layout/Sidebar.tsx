import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Settings,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Assignments", href: "/assignments", icon: ListChecks },
  { label: "Reminders", href: "/reminders", icon: CalendarDays },
];

interface SidebarProps {
  pathname: string;
}

export function Sidebar({ pathname }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[var(--border)] bg-white lg:block">
      <div className="flex h-20 items-center border-b border-[var(--border)] px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="StudyHub home">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--navy)] text-white">
            <BookOpen size={21} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight text-[var(--navy)]">StudyHub</span>
        </Link>
      </div>

      <nav className="flex h-[calc(100%-5rem)] flex-col px-4 py-6" aria-label="Primary navigation">
        <div className="space-y-1">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#EEF4FF] text-[var(--accent)]"
                    : "text-[var(--secondary-text)] hover:bg-[var(--background)] hover:text-[var(--primary-text)]"
                }`}
              >
                <Icon size={19} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/settings"
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={`mt-auto flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${
            pathname === "/settings"
              ? "bg-[#EEF4FF] text-[var(--accent)]"
              : "text-[var(--secondary-text)] hover:bg-[var(--background)] hover:text-[var(--primary-text)]"
          }`}
        >
          <Settings size={19} strokeWidth={2} aria-hidden="true" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
