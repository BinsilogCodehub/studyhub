"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] text-[var(--primary-text)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold text-[var(--primary-text)] sm:text-xl">{title}</h1>
      </div>

      <Link
        href="/settings"
        className="flex h-10 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-[var(--background)] sm:px-2"
        aria-label="Open account settings"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--navy)] text-xs font-bold text-white">
          SH
        </span>
      </Link>
    </header>
  );
}
