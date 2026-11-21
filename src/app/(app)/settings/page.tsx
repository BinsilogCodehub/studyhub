"use client";

import { useState } from "react";
import { Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingState } from "@/components/ui/LoadingState";
import { useStudyData } from "@/providers/study-data-context";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Local StudyHub data could not be reset.";
}

export default function SettingsPage() {
  const { data, status, error, resetStudyData } = useStudyData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function resetData() {
    try {
      resetStudyData();
      setFeedback({ type: "success", message: "Local StudyHub data was cleared." });
      setConfirmReset(false);
    } catch (resetError) {
      setFeedback({ type: "error", message: getErrorMessage(resetError) });
      setConfirmReset(false);
    }
  }

  if (status === "loading") return <LoadingState label="Loading your settings..." />;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-[var(--accent)]">Your preferences</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--primary-text)] sm:text-3xl">
          Settings
        </h2>
        <p className="mt-2 text-sm text-[var(--secondary-text)]">
          Manage how this StudyHub project stores your study information.
        </p>
      </section>

      {feedback ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-[#DCFCE7] text-[#15803D]"
              : "bg-[#FEE2E2] text-[#B91C1C]"
          }`}
          role={feedback.type === "success" ? "status" : "alert"}
        >
          {feedback.message}
        </p>
      ) : null}

      <Card className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EEF4FF] text-[var(--accent)]">
            <Database size={21} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[var(--primary-text)]">Local browser storage</h3>
            {status === "ready" ? (
              <>
                <p className="mt-2 text-sm leading-6 text-[var(--secondary-text)]">
                  Your subjects, assignments, and reminders are saved in this browser on this device.
                  They remain available after refresh, but are not synced to other devices.
                </p>
                <p className="mt-3 text-sm font-medium text-[var(--primary-text)]">
                  {data.subjects.length} subjects · {data.assignments.length} assignments ·{" "}
                  {data.reminders.length} reminders
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-[var(--danger)]" role="alert">
                {error ?? "Saved local data could not be loaded."} You can replace it with an empty
                StudyHub workspace below.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="border-[#FECACA] p-5 sm:p-6">
        <h3 className="font-bold text-[var(--primary-text)]">Reset local data</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--secondary-text)]">
          Remove all subjects, assignments, and reminders saved by StudyHub in this browser. This
          cannot be undone. Use this if you want to start fresh or recover from unreadable saved data.
        </p>
        <Button
          type="button"
          variant="danger"
          className="mt-4"
          onClick={() => setConfirmReset(true)}
        >
          <Trash2 size={17} aria-hidden="true" />
          Reset local data
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all StudyHub data?"
        description="All subjects, assignments, and reminders in this browser will be permanently removed."
        confirmLabel="Reset data"
        onClose={() => setConfirmReset(false)}
        onConfirm={resetData}
      />
    </div>
  );
}
