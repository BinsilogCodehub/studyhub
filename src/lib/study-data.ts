import type {
  Assignment,
  AssignmentPriority,
  AssignmentStatus,
  Reminder,
  StudyData,
  Subject,
} from "@/types";

export const STUDY_DATA_STORAGE_KEY = "studyhub.data.v1";

export function createEmptyStudyData(): StudyData {
  return { subjects: [], assignments: [], reminders: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !Number.isNaN(Date.parse(value));
}

function isSubject(value: unknown): value is Subject {
  return (
    isRecord(value) &&
    typeof value.subjectId === "string" &&
    value.subjectId.trim().length > 0 &&
    typeof value.subjectName === "string" &&
    value.subjectName.trim().length > 0 &&
    typeof value.description === "string" &&
    typeof value.color === "string" &&
    /^#[\da-f]{6}$/i.test(value.color) &&
    (value.userId === undefined || typeof value.userId === "string") &&
    (value.subjectCode === undefined || typeof value.subjectCode === "string") &&
    isDateString(value.createdAt)
  );
}

function isAssignmentPriority(value: unknown): value is AssignmentPriority {
  return value === "Low" || value === "Medium" || value === "High";
}

function isAssignmentStatus(value: unknown): value is AssignmentStatus {
  return value === "Pending" || value === "In Progress" || value === "Completed";
}

function isAssignment(value: unknown): value is Assignment {
  return (
    isRecord(value) &&
    typeof value.assignmentId === "string" &&
    value.assignmentId.trim().length > 0 &&
    (value.subjectId === null || typeof value.subjectId === "string") &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.description === "string" &&
    isDateString(value.dueDate) &&
    isAssignmentPriority(value.priority) &&
    isAssignmentStatus(value.status) &&
    (value.userId === undefined || typeof value.userId === "string") &&
    isDateString(value.createdAt)
  );
}

function isReminder(value: unknown): value is Reminder {
  return (
    isRecord(value) &&
    typeof value.reminderId === "string" &&
    value.reminderId.trim().length > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.description === "string" &&
    isDateString(value.reminderDate) &&
    typeof value.isCompleted === "boolean" &&
    (value.userId === undefined || typeof value.userId === "string") &&
    isDateString(value.createdAt)
  );
}

function isStudyData(value: unknown): value is StudyData {
  return (
    isRecord(value) &&
    Array.isArray(value.subjects) &&
    Array.isArray(value.assignments) &&
    Array.isArray(value.reminders) &&
    value.subjects.every(isSubject) &&
    value.assignments.every(isAssignment) &&
    value.reminders.every(isReminder)
  );
}

export function parseStudyData(serialized: string | null): StudyData {
  if (serialized === null) return createEmptyStudyData();

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    throw new Error("Saved StudyHub data is unreadable and was not changed.");
  }

  if (!isStudyData(value)) {
    throw new Error("Saved StudyHub data is invalid and was not changed.");
  }

  const subjectIds = new Set(value.subjects.map((subject) => subject.subjectId));
  const assignmentIds = new Set(value.assignments.map((assignment) => assignment.assignmentId));
  const reminderIds = new Set(value.reminders.map((reminder) => reminder.reminderId));
  const subjectNames = value.subjects.map((subject) => subject.subjectName.trim().toLocaleLowerCase());

  if (
    subjectIds.size !== value.subjects.length ||
    assignmentIds.size !== value.assignments.length ||
    reminderIds.size !== value.reminders.length ||
    new Set(subjectNames).size !== subjectNames.length ||
    value.assignments.some(
      (assignment) => assignment.subjectId !== null && !subjectIds.has(assignment.subjectId),
    )
  ) {
    throw new Error("Saved StudyHub data contains duplicate or disconnected records and was not changed.");
  }

  return value;
}

export function serializeStudyData(data: StudyData): string {
  return JSON.stringify(data);
}
