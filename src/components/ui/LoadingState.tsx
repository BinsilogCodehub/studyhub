export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-white" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm font-semibold text-[var(--secondary-text)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}
