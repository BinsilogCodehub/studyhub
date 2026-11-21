"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StudyDataStatusMessage } from "@/components/ui/StudyDataStatus";
import { useStudyClock } from "@/lib/clock";
import { formatDate, isPastDueDate } from "@/lib/date-utils";
import { useStudyData } from "@/providers/study-data-context";

export default function DashboardPage() {
  const { data, status, error } = useStudyData();
  const now = useStudyClock();

  if (status !== "ready") {
    return <StudyDataStatusMessage status={status} error={error} />;
  }

  const activeAssignments = data.assignments
    .filter((assignment) => assignment.status !== "Completed")
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));
  const upcomingReminders = data.reminders.filter(
    (reminder) => !reminder.isCompleted && new Date(reminder.reminderDate).getTime() >= now,
  );
  const overview = [
    { label: "Subjects", value: data.subjects.length, icon: BookOpen },
    { label: "Active assignments", value: activeAssignments.length, icon: ClipboardList },
    { label: "Upcoming reminders", value: upcomingReminders.length, icon: CalendarDays },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Your study space</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--primary-text)] sm:text-3xl">
            Welcome to StudyHub
          </h2>
          <p className="mt-2 text-sm text-[var(--secondary-text)] sm:text-base">
            Keep your subjects, assignments, and reminders organized in one place.
          </p>
        </div>
        <Badge tone="blue">Study overview</Badge>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Study overview">
        {overview.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#EEF4FF] text-[var(--accent)]">
              <Icon size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--secondary-text)]">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[var(--primary-text)]">{value}</p>
            </div>
          </Card>
        ))}
      </section>

      <section aria-labelledby="assignments-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 id="assignments-heading" className="text-lg font-bold text-[var(--primary-text)]">
              Upcoming assignments
            </h3>
            <p className="mt-1 text-sm text-[var(--secondary-text)]">
              Your next deadlines, sorted by due date.
            </p>
          </div>
          <Link
            href="/assignments"
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            View all assignments
          </Link>
        </div>

        {activeAssignments.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={22} aria-hidden="true" />}
            title="No open assignments"
            description="When you add assignments, the next ones due will appear here."
            action={
              <Link
                href="/assignments"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
              >
                Go to assignments
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {activeAssignments.slice(0, 5).map((assignment) => {
              const subject = data.subjects.find(
                (item) => item.subjectId === assignment.subjectId,
              );
              const overdue = isPastDueDate(assignment.dueDate, new Date(now));

              return (
                <Card
                  key={assignment.assignmentId}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EEF4FF] text-[var(--accent)]">
                      <ClipboardList size={19} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--primary-text)]">
                        {assignment.title}
                      </p>
                      <p className="mt-1 truncate text-sm text-[var(--secondary-text)]">
                        {subject?.subjectName ?? "Subject removed"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {overdue ? <Badge tone="red">Overdue</Badge> : null}
                    <Badge tone={assignment.status === "In Progress" ? "blue" : "gray"}>
                      {assignment.status}
                    </Badge>
                    <span className={`text-sm font-semibold ${overdue ? "text-[var(--danger)]" : "text-[var(--secondary-text)]"}`}>
                      Due {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-center justify-between gap-4 p-5">
          <div>
            <h3 className="font-bold text-[var(--primary-text)]">Your subjects</h3>
            <p className="mt-1 text-sm text-[var(--secondary-text)]">
              {data.subjects.length} {data.subjects.length === 1 ? "subject" : "subjects"} organized
            </p>
          </div>
          <Link
            href="/subjects"
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Manage
          </Link>
        </Card>
        <Card className="flex items-center justify-between gap-4 p-5">
          <div>
            <h3 className="font-bold text-[var(--primary-text)]">Your reminders</h3>
            <p className="mt-1 text-sm text-[var(--secondary-text)]">
              {upcomingReminders.length} coming up
            </p>
          </div>
          <Link
            href="/reminders"
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Manage
          </Link>
        </Card>
      </section>
    </div>
  );
}
