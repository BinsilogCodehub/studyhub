import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-[var(--primary-text)]">
        {label}
        {required ? <span className="ml-1 text-[var(--danger)]" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-sm text-[var(--secondary-text)]">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ hasError, className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-[var(--primary-text)] outline-none transition-colors placeholder:text-[#A0AEC0] focus:border-[var(--accent)] focus:ring-3 focus:ring-[#DBEAFE] disabled:bg-[var(--background)] disabled:text-[var(--secondary-text)] ${
        hasError ? "border-[var(--danger)]" : "border-[var(--border)]"
      } ${className}`}
      {...props}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function Textarea({ hasError, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`min-h-24 w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-[var(--primary-text)] outline-none transition-colors placeholder:text-[#A0AEC0] focus:border-[var(--accent)] focus:ring-3 focus:ring-[#DBEAFE] disabled:bg-[var(--background)] ${
        hasError ? "border-[var(--danger)]" : "border-[var(--border)]"
      } ${className}`}
      {...props}
    />
  );
}
