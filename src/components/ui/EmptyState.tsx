import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-10 text-center">
      {icon ? <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-[#EEF4FF] text-[var(--accent)]">{icon}</div> : null}
      <h3 className="text-base font-bold text-[var(--primary-text)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--secondary-text)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
