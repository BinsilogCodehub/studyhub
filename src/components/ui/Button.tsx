import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[var(--accent)] text-white hover:bg-[#2563EB] focus-visible:ring-[#93C5FD]",
    secondary:
      "border border-[var(--border)] bg-white text-[var(--primary-text)] hover:bg-[var(--background)]",
    danger:
      "bg-[var(--danger)] text-white hover:bg-[#B91C1C] focus-visible:ring-[#FCA5A5]",
    ghost: "text-[var(--secondary-text)] hover:bg-[var(--background)] hover:text-[var(--primary-text)]",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
