"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarDays, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StudyDataStatusMessage } from "@/components/ui/StudyDataStatus";
import { useStudyClock } from "@/lib/clock";
import { formatDate, getLocalDateValue, isPastDueDate } from "@/lib/date-utils";
import { useStudyData } from "@/providers/study-data-context";
import type { AssignmentInput } from "@/lib/study-data-store";
import type { Assignment, AssignmentPriority, AssignmentStatus } from "@/types";

const priorities: AssignmentPriority[] = ["Low", "Medium", "High"];
const statuses: AssignmentStatus[] = ["Pending", "In Progress", "Completed"];

type ModalState =
  | { type: "form"; assignmentId: string | null }
  | { type: "delete"; assignment: Assignment }
  | null;

function getDefaultForm(subjectId = ""): AssignmentInput {
  return {
    title: "",
    description: "",
    subjectId,
    dueDate: getLocalDateValue(),
    priority: "Medium",
    status: "Pending",
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The assignment could not be saved.";
}

function statusTone(status: AssignmentStatus): "gray" | "blue" | "green" {
  if (status === "Completed") return "green";
  if (status === "In Progress") return "blue";
  return "gray";
}

function priorityTone(priority: AssignmentPriority): "gray" | "blue" | "yellow" {
  if (priority === "High") return "yellow";
  if (priority === "Medium") return "blue";
  return "gray";
}

export default function AssignmentsPage() {
  const { data, status, error, addAssignment, updateAssignment, deleteAssignment } = useStudyData();
  const now = useStudyClock();
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<AssignmentInput>({
    title: "",
    description: "",
    subjectId: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  function openCreate() {
    setForm(getDefaultForm(data.subjects[0]?.subjectId ?? ""));
    setFormError(null);
    setModal({ type: "form", assignmentId: null });
  }

  function openEdit(assignment: Assignment) {
    setForm({
      title: assignment.title,
      description: assignment.description,
      subjectId: assignment.subjectId,
      dueDate: assignment.dueDate.slice(0, 10),
      priority: assignment.priority,
      status: assignment.status,
    });
    setFormError(null);
    setModal({ type: "form", assignmentId: assignment.assignmentId });
  }

  function submitAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modal?.type !== "form") return;

    try {
      if (modal.assignmentId) {
        updateAssignment(modal.assignmentId, form);
        setFeedback({ type: "success", message: "Assignment updated." });
      } else {
        addAssignment(form);
        setFeedback({ type: "success", message: "Assignment added." });
      }
      setModal(null);
      setFormError(null);
    } catch (submitError) {
      setFormError(getErrorMessage(submitError));
    }
  }

  function confirmDelete() {
    if (modal?.type !== "delete") return;
    try {
      deleteAssignment(modal.assignment.assignmentId);
      setFeedback({ type: "success", message: "Assignment deleted." });
    } catch (deleteError) {
      setFeedback({ type: "error", message: getErrorMessage(deleteError) });
    }
    setModal(null);
  }

  if (status !== "ready") {
    return <StudyDataStatusMessage status={status} error={error} />;
  }

  const editingAssignment = modal?.type === "form" && modal.assignmentId
    ? data.assignments.find((assignment) => assignment.assignmentId === modal.assignmentId)
    : null;
  const subjectRequired = !editingAssignment || editingAssignment.subjectId !== null;
  const filteredAssignments = data.assignments
    .filter((assignment) => !statusFilter || assignment.status === statusFilter)
    .filter((assignment) => !subjectFilter || assignment.subjectId === subjectFilter)
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Stay on track</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--primary-text)] sm:text-3xl">
            Assignments
          </h2>
          <p className="mt-2 text-sm text-[var(--secondary-text)]">
            Keep deadlines, priorities, and progress in one place.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={data.subjects.length === 0}>
          <Plus size={18} aria-hidden="true" />
          Add assignment
        </Button>
      </section>

      {feedback ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-[#DCFCE7] text-[#15803D]"
              : "bg-[#FEE2E2] text-[#B91C1C]"
          }`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      ) : null}

      {data.subjects.length === 0 ? (
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--secondary-text)]">
            Add a subject before creating assignments. Existing assignments remain available even if
            their subject is removed.
          </p>
          <Link
            href="/subjects"
            className="shrink-0 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Go to subjects
          </Link>
        </Card>
      ) : null}

      <Card className="grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Filter by status" htmlFor="status-filter">
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--primary-text)] outline-none focus:border-[var(--accent)] focus:ring-3 focus:ring-[#DBEAFE]"
          >
            <option value="">All statuses</option>
            {statuses.map((assignmentStatus) => (
              <option key={assignmentStatus} value={assignmentStatus}>
                {assignmentStatus}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Filter by subject" htmlFor="subject-filter">
          <select
            id="subject-filter"
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--primary-text)] outline-none focus:border-[var(--accent)] focus:ring-3 focus:ring-[#DBEAFE]"
          >
            <option value="">All subjects</option>
            {data.subjects.map((subject) => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.subjectName}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={22} aria-hidden="true" />}
          title={data.assignments.length === 0 ? "No assignments yet" : "No matching assignments"}
          description={
            data.assignments.length === 0
              ? "Add an assignment to start tracking your upcoming work."
              : "Try changing the status or subject filters."
          }
          action={
            data.assignments.length === 0 && data.subjects.length > 0 ? (
              <Button type="button" onClick={openCreate}>
                <Plus size={18} aria-hidden="true" />
                Add assignment
              </Button>
            ) : data.assignments.length > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStatusFilter("");
                  setSubjectFilter("");
                }}
              >
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2" aria-label="Assignments">
          {filteredAssignments.map((assignment) => {
            const subject = data.subjects.find(
              (item) => item.subjectId === assignment.subjectId,
            );
            const overdue =
              assignment.status !== "Completed" &&
              isPastDueDate(assignment.dueDate, new Date(now));

            return (
              <Card key={assignment.assignmentId} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--primary-text)]">
                        {assignment.title}
                      </h3>
                      {overdue ? <Badge tone="red">Overdue</Badge> : null}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-[var(--secondary-text)]">
                      {assignment.description || "No description added."}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${assignment.title}`}
                      onClick={() => openEdit(assignment)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${assignment.title}`}
                      onClick={() => setModal({ type: "delete", assignment })}
                    >
                      <Trash2 size={16} className="text-[var(--danger)]" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(assignment.status)}>{assignment.status}</Badge>
                  <Badge tone={priorityTone(assignment.priority)}>
                    {assignment.priority} priority
                  </Badge>
                  <Badge tone="gray">{subject?.subjectName ?? "Subject removed"}</Badge>
                </div>
                <p className={`mt-4 flex items-center gap-2 text-sm font-medium ${overdue ? "text-[var(--danger)]" : "text-[var(--secondary-text)]"}`}>
                  <CalendarDays size={16} aria-hidden="true" />
                  Due {formatDate(assignment.dueDate)}
                </p>
              </Card>
            );
          })}
        </section>
      )}

      <Modal
        open={modal?.type === "form"}
        title={editingAssignment ? "Edit assignment" : "Add an assignment"}
        description="Set a due date and connect this work to one of your subjects."
        onClose={() => setModal(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" form="assignment-form">
              {editingAssignment ? "Save changes" : "Add assignment"}
            </Button>
          </>
        }
      >
        <form id="assignment-form" className="space-y-4" onSubmit={submitAssignment}>
          <Field label="Title" htmlFor="assignment-title" required>
            <Input
              id="assignment-title"
              autoFocus
              required
              maxLength={120}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="e.g. Chapter 4 lab report"
            />
          </Field>
          <Field label="Description" htmlFor="assignment-description">
            <Textarea
              id="assignment-description"
              maxLength={1000}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Add notes or instructions (optional)"
            />
          </Field>
          <Field label="Subject" htmlFor="assignment-subject" required={subjectRequired}>
            <select
              id="assignment-subject"
              required={subjectRequired}
              value={form.subjectId ?? ""}
              onChange={(event) =>
                setForm({ ...form, subjectId: event.target.value || null })
              }
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--primary-text)] outline-none focus:border-[var(--accent)] focus:ring-3 focus:ring-[#DBEAFE]"
            >
              <option value="" disabled={subjectRequired}>
                {subjectRequired ? "Choose a subject" : "Unassigned"}
              </option>
              {data.subjects.map((subject) => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Due date" htmlFor="assignment-due-date" required>
              <Input
                id="assignment-due-date"
                type="date"
                required
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              />
            </Field>
            <Field label="Priority" htmlFor="assignment-priority" required>
              <select
                id="assignment-priority"
                required
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value as AssignmentPriority })
                }
                className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--primary-text)] outline-none focus:border-[var(--accent)] focus:ring-3 focus:ring-[#DBEAFE]"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Status" htmlFor="assignment-status" required>
            <select
              id="assignment-status"
              required
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as AssignmentStatus })
              }
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--primary-text)] outline-none focus:border-[var(--accent)] focus:ring-3 focus:ring-[#DBEAFE]"
            >
              {statuses.map((assignmentStatus) => (
                <option key={assignmentStatus} value={assignmentStatus}>
                  {assignmentStatus}
                </option>
              ))}
            </select>
          </Field>
          {formError ? <p className="text-sm text-[var(--danger)]" role="alert">{formError}</p> : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={modal?.type === "delete"}
        title="Delete assignment?"
        description={
          modal?.type === "delete"
            ? `“${modal.assignment.title}” will be permanently removed.`
            : ""
        }
        onClose={() => setModal(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
