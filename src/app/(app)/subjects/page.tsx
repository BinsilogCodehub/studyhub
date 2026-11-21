"use client";

import { useState, type FormEvent } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StudyDataStatusMessage } from "@/components/ui/StudyDataStatus";
import { useStudyData } from "@/providers/study-data-context";
import type { SubjectInput } from "@/lib/study-data-store";
import type { Subject } from "@/types";

const defaultForm: SubjectInput = {
  subjectName: "",
  description: "",
  color: "#3B82F6",
};

type ModalState =
  | { type: "form"; subjectId: string | null }
  | { type: "delete"; subject: Subject }
  | null;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The subject could not be saved.";
}

export default function SubjectsPage() {
  const { data, status, error, addSubject, updateSubject, deleteSubject } = useStudyData();
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<SubjectInput>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  function openCreate() {
    setForm(defaultForm);
    setFormError(null);
    setModal({ type: "form", subjectId: null });
  }

  function openEdit(subject: Subject) {
    setForm({
      subjectName: subject.subjectName,
      description: subject.description,
      color: subject.color,
    });
    setFormError(null);
    setModal({ type: "form", subjectId: subject.subjectId });
  }

  function submitSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modal?.type !== "form") return;

    try {
      if (modal.subjectId) {
        updateSubject(modal.subjectId, form);
        setFeedback({ type: "success", message: "Subject updated." });
      } else {
        addSubject(form);
        setFeedback({ type: "success", message: "Subject added." });
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
      deleteSubject(modal.subject.subjectId);
      setFeedback({ type: "success", message: "Subject deleted. Its assignments were kept." });
      setModal(null);
    } catch (deleteError) {
      setFeedback({ type: "error", message: getErrorMessage(deleteError) });
      setModal(null);
    }
  }

  if (status !== "ready") {
    return <StudyDataStatusMessage status={status} error={error} />;
  }

  const editingSubject = modal?.type === "form" && modal.subjectId
    ? data.subjects.find((subject) => subject.subjectId === modal.subjectId)
    : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Your courses</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--primary-text)] sm:text-3xl">
            Subjects
          </h2>
          <p className="mt-2 text-sm text-[var(--secondary-text)]">
            Organize your classes and connect assignments to a subject.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus size={18} aria-hidden="true" />
          Add subject
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
        <EmptyState
          icon={<BookOpen size={22} aria-hidden="true" />}
          title="No subjects yet"
          description="Add your first subject to keep related assignments organized."
          action={
            <Button type="button" onClick={openCreate}>
              <Plus size={18} aria-hidden="true" />
              Add your first subject
            </Button>
          }
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Your subjects">
          {data.subjects.map((subject) => {
            const assignmentCount = data.assignments.filter(
              (assignment) => assignment.subjectId === subject.subjectId,
            ).length;

            return (
              <Card key={subject.subjectId} className="overflow-hidden">
                <div className="h-1.5" style={{ backgroundColor: subject.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-11 w-11 shrink-0 rounded-xl"
                        style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                        aria-hidden="true"
                      >
                        <span className="grid h-full place-items-center">
                          <BookOpen size={20} />
                        </span>
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-[var(--primary-text)]">
                          {subject.subjectName}
                        </h3>
                        <Badge tone="gray" className="mt-1">
                          {assignmentCount} {assignmentCount === 1 ? "assignment" : "assignments"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${subject.subjectName}`}
                        onClick={() => openEdit(subject)}
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${subject.subjectName}`}
                        onClick={() => setModal({ type: "delete", subject })}
                      >
                        <Trash2 size={16} className="text-[var(--danger)]" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-4 min-h-10 whitespace-pre-wrap text-sm leading-5 text-[var(--secondary-text)]">
                    {subject.description || "No description added."}
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--secondary-text)]">
                    <span
                      className="h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: subject.color }}
                      aria-hidden="true"
                    />
                    Subject color
                  </p>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <Modal
        open={modal?.type === "form"}
        title={editingSubject ? "Edit subject" : "Add a subject"}
        description="Choose a name and color to make this subject easy to recognize."
        onClose={() => setModal(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" form="subject-form">
              {editingSubject ? "Save changes" : "Add subject"}
            </Button>
          </>
        }
      >
        <form id="subject-form" className="space-y-4" onSubmit={submitSubject}>
          <Field label="Subject name" htmlFor="subject-name" required>
            <Input
              id="subject-name"
              autoFocus
              required
              maxLength={80}
              value={form.subjectName}
              onChange={(event) => setForm({ ...form, subjectName: event.target.value })}
              placeholder="e.g. Biology"
            />
          </Field>
          <Field label="Description" htmlFor="subject-description">
            <Textarea
              id="subject-description"
              maxLength={500}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Add a short description (optional)"
            />
          </Field>
          <Field label="Subject color" htmlFor="subject-color" required>
            <Input
              id="subject-color"
              type="color"
              required
              value={form.color}
              onChange={(event) => setForm({ ...form, color: event.target.value })}
              className="h-12 cursor-pointer p-1"
            />
          </Field>
          {formError ? <p className="text-sm text-[var(--danger)]" role="alert">{formError}</p> : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={modal?.type === "delete"}
        title="Delete subject?"
        description={
          modal?.type === "delete"
            ? `“${modal.subject.subjectName}” will be deleted. Its assignments will remain but become unassigned.`
            : ""
        }
        onClose={() => setModal(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
