"use client";

import { useState, type FormEvent } from "react";
import { Bell, Check, Clock3, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StudyDataStatusMessage } from "@/components/ui/StudyDataStatus";
import { useStudyClock } from "@/lib/clock";
import {
  formatDateTime,
  getLocalDateTimeInputValue,
  getLocalDateTimeValue,
} from "@/lib/date-utils";
import { useStudyData } from "@/providers/study-data-context";
import type { ReminderInput } from "@/lib/study-data-store";
import type { Reminder } from "@/types";

type ModalState =
  | { type: "form"; reminderId: string | null }
  | { type: "delete"; reminder: Reminder }
  | null;

function getDefaultForm(): ReminderInput {
  return {
    title: "",
    description: "",
    reminderDate: getLocalDateTimeValue(),
    isCompleted: false,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The reminder could not be saved.";
}

export default function RemindersPage() {
  const {
    data,
    status,
    error,
    addReminder,
    updateReminder,
    setReminderCompleted,
    deleteReminder,
  } = useStudyData();
  const now = useStudyClock();
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<ReminderInput>({
    title: "",
    description: "",
    reminderDate: "",
    isCompleted: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  function openCreate() {
    setForm(getDefaultForm());
    setFormError(null);
    setModal({ type: "form", reminderId: null });
  }

  function openEdit(reminder: Reminder) {
    setForm({
      title: reminder.title,
      description: reminder.description,
      reminderDate: getLocalDateTimeInputValue(reminder.reminderDate),
      isCompleted: reminder.isCompleted,
    });
    setFormError(null);
    setModal({ type: "form", reminderId: reminder.reminderId });
  }

  function submitReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modal?.type !== "form") return;

    try {
      if (modal.reminderId) {
        updateReminder(modal.reminderId, form);
        setFeedback({ type: "success", message: "Reminder updated." });
      } else {
        addReminder(form);
        setFeedback({ type: "success", message: "Reminder created." });
      }
      setModal(null);
      setFormError(null);
    } catch (submitError) {
      setFormError(getErrorMessage(submitError));
    }
  }

  function toggleCompleted(reminder: Reminder) {
    try {
      setReminderCompleted(reminder.reminderId, !reminder.isCompleted);
      setFeedback({
        type: "success",
        message: reminder.isCompleted ? "Reminder moved back to upcoming." : "Reminder completed.",
      });
    } catch (toggleError) {
      setFeedback({ type: "error", message: getErrorMessage(toggleError) });
    }
  }

  function confirmDelete() {
    if (modal?.type !== "delete") return;
    try {
      deleteReminder(modal.reminder.reminderId);
      setFeedback({ type: "success", message: "Reminder deleted." });
    } catch (deleteError) {
      setFeedback({ type: "error", message: getErrorMessage(deleteError) });
    }
    setModal(null);
  }

  if (status !== "ready") {
    return <StudyDataStatusMessage status={status} error={error} />;
  }

  const editingReminder = modal?.type === "form" && modal.reminderId
    ? data.reminders.find((reminder) => reminder.reminderId === modal.reminderId)
    : null;
  const upcomingReminders = data.reminders
    .filter((reminder) => !reminder.isCompleted)
    .sort((first, second) => first.reminderDate.localeCompare(second.reminderDate));
  const completedReminders = data.reminders
    .filter((reminder) => reminder.isCompleted)
    .sort((first, second) => second.reminderDate.localeCompare(first.reminderDate));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Remember what matters</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--primary-text)] sm:text-3xl">
            Reminders
          </h2>
          <p className="mt-2 text-sm text-[var(--secondary-text)]">
            Add a date and time so important study moments do not slip by.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus size={18} aria-hidden="true" />
          Add reminder
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

      <section aria-labelledby="upcoming-reminders-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 id="upcoming-reminders-heading" className="text-lg font-bold text-[var(--primary-text)]">
              Upcoming reminders
            </h3>
            <p className="mt-1 text-sm text-[var(--secondary-text)]">
              {upcomingReminders.length} active
            </p>
          </div>
        </div>

        {upcomingReminders.length === 0 ? (
          <EmptyState
            icon={<Bell size={22} aria-hidden="true" />}
            title="No upcoming reminders"
            description="Create a reminder for a study session, deadline, or anything else you want to remember."
            action={
              <Button type="button" onClick={openCreate}>
                <Plus size={18} aria-hidden="true" />
                Add reminder
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {upcomingReminders.map((reminder) => {
              const overdue = new Date(reminder.reminderDate).getTime() < now;

              return (
                <Card key={reminder.reminderId} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EEF4FF] text-[var(--accent)]">
                        <Bell size={19} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-[var(--primary-text)]">{reminder.title}</h4>
                          {overdue ? <Badge tone="red">Past due</Badge> : null}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-[var(--secondary-text)]">
                          {reminder.description || "No description added."}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${reminder.title}`}
                        onClick={() => openEdit(reminder)}
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${reminder.title}`}
                        onClick={() => setModal({ type: "delete", reminder })}
                      >
                        <Trash2 size={16} className="text-[var(--danger)]" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className={`flex items-center gap-2 text-sm font-medium ${overdue ? "text-[var(--danger)]" : "text-[var(--secondary-text)]"}`}>
                      <Clock3 size={16} aria-hidden="true" />
                      {formatDateTime(reminder.reminderDate)}
                    </p>
                    <Button type="button" variant="secondary" size="sm" onClick={() => toggleCompleted(reminder)}>
                      <Check size={16} aria-hidden="true" />
                      Mark complete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="completed-reminders-heading" className="space-y-4">
        <div>
          <h3 id="completed-reminders-heading" className="text-lg font-bold text-[var(--primary-text)]">
            Completed
          </h3>
          <p className="mt-1 text-sm text-[var(--secondary-text)]">
            {completedReminders.length} completed
          </p>
        </div>
        {completedReminders.length === 0 ? (
          <Card className="p-5 text-sm text-[var(--secondary-text)]">
            Completed reminders will appear here.
          </Card>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {completedReminders.map((reminder) => (
              <Card key={reminder.reminderId} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate font-semibold text-[var(--primary-text)]">{reminder.title}</h4>
                    <Badge tone="green">Completed</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--secondary-text)]">
                    {formatDateTime(reminder.reminderDate)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${reminder.title}`}
                    onClick={() => openEdit(reminder)}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Reopen ${reminder.title}`}
                    onClick={() => toggleCompleted(reminder)}
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${reminder.title}`}
                    onClick={() => setModal({ type: "delete", reminder })}
                  >
                    <Trash2 size={16} className="text-[var(--danger)]" aria-hidden="true" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={modal?.type === "form"}
        title={editingReminder ? "Edit reminder" : "Create a reminder"}
        description="Choose when you want this reminder to appear in your study space."
        onClose={() => setModal(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" form="reminder-form">
              {editingReminder ? "Save changes" : "Create reminder"}
            </Button>
          </>
        }
      >
        <form id="reminder-form" className="space-y-4" onSubmit={submitReminder}>
          <Field label="Title" htmlFor="reminder-title" required>
            <Input
              id="reminder-title"
              autoFocus
              required
              maxLength={120}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="e.g. Review chemistry notes"
            />
          </Field>
          <Field label="Description" htmlFor="reminder-description">
            <Textarea
              id="reminder-description"
              maxLength={1000}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Add a note (optional)"
            />
          </Field>
          <Field label="Date and time" htmlFor="reminder-date" required>
            <Input
              id="reminder-date"
              type="datetime-local"
              required
              value={form.reminderDate}
              onChange={(event) => setForm({ ...form, reminderDate: event.target.value })}
            />
          </Field>
          {formError ? <p className="text-sm text-[var(--danger)]" role="alert">{formError}</p> : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={modal?.type === "delete"}
        title="Delete reminder?"
        description={
          modal?.type === "delete"
            ? `“${modal.reminder.title}” will be permanently removed.`
            : ""
        }
        onClose={() => setModal(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
