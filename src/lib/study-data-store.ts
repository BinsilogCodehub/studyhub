import type {
  Assignment,
  Reminder,
  StudyData,
  Subject,
} from "@/types";
import {
  createEmptyStudyData,
  parseStudyData,
  serializeStudyData,
  STUDY_DATA_STORAGE_KEY,
} from "@/lib/study-data";

export type StudyDataStatus = "loading" | "ready" | "error";
export type SubjectInput = Pick<Subject, "subjectName" | "description" | "color">;
export type AssignmentInput = Pick<
  Assignment,
  "title" | "description" | "subjectId" | "dueDate" | "priority" | "status"
>;
export type ReminderInput = Pick<
  Reminder,
  "title" | "description" | "reminderDate" | "isCompleted"
>;

interface StudyDataSnapshot {
  data: StudyData;
  status: StudyDataStatus;
  error: string | null;
}

const serverSnapshot: StudyDataSnapshot = {
  data: createEmptyStudyData(),
  status: "loading",
  error: null,
};
let snapshot = serverSnapshot;
let initialized = false;
const listeners = new Set<() => void>();

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function publish(next: StudyDataSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function initialize() {
  if (initialized) return;
  initialized = true;

  try {
    const saved = window.localStorage.getItem(STUDY_DATA_STORAGE_KEY);
    publish({ data: parseStudyData(saved), status: "ready", error: null });
  } catch (loadError) {
    publish({
      data: createEmptyStudyData(),
      status: "error",
      error: getErrorMessage(
        loadError,
        "StudyHub could not read local browser storage. Your saved data was not changed.",
      ),
    });
  }
}

function syncFromAnotherTab(event: StorageEvent) {
  if (event.key !== STUDY_DATA_STORAGE_KEY && event.key !== null) return;

  try {
    publish({ data: parseStudyData(event.newValue), status: "ready", error: null });
  } catch (syncError) {
    publish({
      ...snapshot,
      status: "error",
      error: getErrorMessage(
        syncError,
        "StudyHub could not sync saved data from another browser tab.",
      ),
    });
  }
}

export function subscribeToStudyData(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    initialize();
    window.addEventListener("storage", syncFromAnotherTab);
    listener();
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", syncFromAnotherTab);
    }
  };
}

export function getStudyDataSnapshot(): StudyDataSnapshot {
  return snapshot;
}

export function getStudyDataServerSnapshot(): StudyDataSnapshot {
  return serverSnapshot;
}

function persist(data: StudyData, allowRecovery = false) {
  if (snapshot.status !== "ready" && !allowRecovery) {
    throw new Error("StudyHub data is not ready. Visit Settings to recover local data first.");
  }

  try {
    window.localStorage.setItem(STUDY_DATA_STORAGE_KEY, serializeStudyData(data));
  } catch (saveError) {
    throw new Error(
      `StudyHub could not save to this browser: ${getErrorMessage(saveError, "storage is unavailable")}`,
    );
  }

  publish({ data, status: "ready", error: null });
}

function requireText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required.`);
  return trimmed;
}

function requireDate(value: string, field: string): string {
  if (!value || Number.isNaN(Date.parse(value))) throw new Error(`${field} must be a valid date.`);
  return value;
}

function createId(): string {
  return crypto.randomUUID();
}

function addSubject(input: SubjectInput): Subject {
  const subjectName = requireText(input.subjectName, "Subject name");
  if (
    snapshot.data.subjects.some(
      (subject) =>
        subject.subjectName.trim().toLocaleLowerCase() === subjectName.toLocaleLowerCase(),
    )
  ) {
    throw new Error("A subject with this name already exists.");
  }
  if (!/^#[\da-f]{6}$/i.test(input.color)) throw new Error("Choose a valid subject color.");

  const subject: Subject = {
    subjectId: createId(),
    subjectName,
    description: input.description.trim(),
    color: input.color,
    createdAt: new Date().toISOString(),
  };
  persist({ ...snapshot.data, subjects: [...snapshot.data.subjects, subject] });
  return subject;
}

function updateSubject(subjectId: string, input: SubjectInput): Subject {
  const current = snapshot.data.subjects.find((subject) => subject.subjectId === subjectId);
  if (!current) throw new Error("This subject no longer exists.");

  const subjectName = requireText(input.subjectName, "Subject name");
  if (
    snapshot.data.subjects.some(
      (subject) =>
        subject.subjectId !== subjectId &&
        subject.subjectName.trim().toLocaleLowerCase() === subjectName.toLocaleLowerCase(),
    )
  ) {
    throw new Error("A subject with this name already exists.");
  }
  if (!/^#[\da-f]{6}$/i.test(input.color)) throw new Error("Choose a valid subject color.");

  const updated = { ...current, ...input, subjectName, description: input.description.trim() };
  persist({
    ...snapshot.data,
    subjects: snapshot.data.subjects.map((subject) =>
      subject.subjectId === subjectId ? updated : subject,
    ),
  });
  return updated;
}

function deleteSubject(subjectId: string) {
  if (!snapshot.data.subjects.some((subject) => subject.subjectId === subjectId)) {
    throw new Error("This subject no longer exists.");
  }

  persist({
    ...snapshot.data,
    subjects: snapshot.data.subjects.filter((subject) => subject.subjectId !== subjectId),
    assignments: snapshot.data.assignments.map((assignment) =>
      assignment.subjectId === subjectId ? { ...assignment, subjectId: null } : assignment,
    ),
  });
}

function validateAssignmentInput(
  input: AssignmentInput,
  allowUnassigned = false,
): AssignmentInput {
  const title = requireText(input.title, "Assignment title");
  requireDate(input.dueDate, "Due date");
  if (
    (input.subjectId === null && !allowUnassigned) ||
    (input.subjectId !== null &&
      !snapshot.data.subjects.some((subject) => subject.subjectId === input.subjectId))
  ) {
    throw new Error("Choose an existing subject for this assignment.");
  }
  if (!["Low", "Medium", "High"].includes(input.priority)) {
    throw new Error("Choose a valid assignment priority.");
  }
  if (!["Pending", "In Progress", "Completed"].includes(input.status)) {
    throw new Error("Choose a valid assignment status.");
  }
  return { ...input, title, description: input.description.trim() };
}

function addAssignment(input: AssignmentInput): Assignment {
  const assignment: Assignment = {
    assignmentId: createId(),
    ...validateAssignmentInput(input),
    createdAt: new Date().toISOString(),
  };
  persist({ ...snapshot.data, assignments: [...snapshot.data.assignments, assignment] });
  return assignment;
}

function updateAssignment(assignmentId: string, input: AssignmentInput): Assignment {
  const current = snapshot.data.assignments.find(
    (assignment) => assignment.assignmentId === assignmentId,
  );
  if (!current) throw new Error("This assignment no longer exists.");

  const updated = {
    ...current,
    ...validateAssignmentInput(input, current.subjectId === null),
  };
  persist({
    ...snapshot.data,
    assignments: snapshot.data.assignments.map((assignment) =>
      assignment.assignmentId === assignmentId ? updated : assignment,
    ),
  });
  return updated;
}

function deleteAssignment(assignmentId: string) {
  if (!snapshot.data.assignments.some((assignment) => assignment.assignmentId === assignmentId)) {
    throw new Error("This assignment no longer exists.");
  }
  persist({
    ...snapshot.data,
    assignments: snapshot.data.assignments.filter(
      (assignment) => assignment.assignmentId !== assignmentId,
    ),
  });
}

function validateReminderInput(input: ReminderInput): ReminderInput {
  const title = requireText(input.title, "Reminder title");
  requireDate(input.reminderDate, "Reminder date and time");
  return { ...input, title, description: input.description.trim() };
}

function addReminder(input: ReminderInput): Reminder {
  const reminder: Reminder = {
    reminderId: createId(),
    ...validateReminderInput(input),
    createdAt: new Date().toISOString(),
  };
  persist({ ...snapshot.data, reminders: [...snapshot.data.reminders, reminder] });
  return reminder;
}

function updateReminder(reminderId: string, input: ReminderInput): Reminder {
  const current = snapshot.data.reminders.find((reminder) => reminder.reminderId === reminderId);
  if (!current) throw new Error("This reminder no longer exists.");

  const updated = { ...current, ...validateReminderInput(input) };
  persist({
    ...snapshot.data,
    reminders: snapshot.data.reminders.map((reminder) =>
      reminder.reminderId === reminderId ? updated : reminder,
    ),
  });
  return updated;
}

function setReminderCompleted(reminderId: string, isCompleted: boolean): Reminder {
  const current = snapshot.data.reminders.find((reminder) => reminder.reminderId === reminderId);
  if (!current) throw new Error("This reminder no longer exists.");

  const updated = { ...current, isCompleted };
  persist({
    ...snapshot.data,
    reminders: snapshot.data.reminders.map((reminder) =>
      reminder.reminderId === reminderId ? updated : reminder,
    ),
  });
  return updated;
}

function deleteReminder(reminderId: string) {
  if (!snapshot.data.reminders.some((reminder) => reminder.reminderId === reminderId)) {
    throw new Error("This reminder no longer exists.");
  }
  persist({
    ...snapshot.data,
    reminders: snapshot.data.reminders.filter((reminder) => reminder.reminderId !== reminderId),
  });
}

function resetStudyData() {
  persist(createEmptyStudyData(), true);
}

export {
  addAssignment,
  addReminder,
  addSubject,
  deleteAssignment,
  deleteReminder,
  deleteSubject,
  resetStudyData,
  setReminderCompleted,
  updateAssignment,
  updateReminder,
  updateSubject,
};
