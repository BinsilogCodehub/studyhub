"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, description, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--navy)]/40"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:max-w-lg sm:rounded-xl"
      >
        <header className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div className="pr-4">
            <h2 id="modal-title" className="text-lg font-bold text-[var(--primary-text)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-[var(--secondary-text)]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--secondary-text)] hover:bg-[var(--background)]"
            aria-label="Close dialog"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>
        <div className="px-5 py-5 sm:px-6">{children}</div>
        {footer ? <footer className="flex justify-end gap-3 border-t border-[var(--border)] px-5 py-4 sm:px-6">{footer}</footer> : null}
      </section>
    </div>
  );
}
