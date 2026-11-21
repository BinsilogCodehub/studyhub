import type { ReactNode } from "react";

interface BadgeProps {
  tone?: "gray" | "blue" | "green" | "yellow" | "red";
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "gray", children, className = "" }: BadgeProps) {
  const tones = {
    gray: "bg-[#F1F5F9] text-[#64748B]",
    blue: "bg-[#DBEAFE] text-[#2563EB]",
    green: "bg-[#DCFCE7] text-[#15803D]",
    yellow: "bg-[#FEF3C7] text-[#A16207]",
    red: "bg-[#FEE2E2] text-[#B91C1C]",
  };

  return (
    <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-bold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
