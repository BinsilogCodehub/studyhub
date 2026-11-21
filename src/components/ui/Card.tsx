import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(23,43,77,0.04)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
