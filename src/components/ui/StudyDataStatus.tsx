import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import type { StudyDataStatus } from "@/lib/study-data-store";

interface StudyDataStatusProps {
  status: StudyDataStatus;
  error: string | null;
}

export function StudyDataStatusMessage({ status, error }: StudyDataStatusProps) {
  if (status === "loading") return <LoadingState label="Loading your StudyHub data..." />;
  if (status === "ready") return null;

  return (
    <Card className="flex items-start gap-3 p-5" role="alert">
      <AlertCircle className="mt-0.5 shrink-0 text-[var(--danger)]" size={20} aria-hidden="true" />
      <div>
        <h2 className="font-bold text-[var(--primary-text)]">Study data is unavailable</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--secondary-text)]">
          {error ?? "StudyHub could not load its saved data."}
        </p>
        <Link
          href="/settings"
          className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          Open data settings
        </Link>
      </div>
    </Card>
  );
}
