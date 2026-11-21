"use client";

import { createContext, useContext } from "react";
import type { StudyData } from "@/types";
import type { StudyDataStatus } from "@/lib/study-data-store";
import {
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
} from "@/lib/study-data-store";

interface StudyDataContextValue {
  data: StudyData;
  status: StudyDataStatus;
  error: string | null;
  addSubject: typeof addSubject;
  updateSubject: typeof updateSubject;
  deleteSubject: typeof deleteSubject;
  addAssignment: typeof addAssignment;
  updateAssignment: typeof updateAssignment;
  deleteAssignment: typeof deleteAssignment;
  addReminder: typeof addReminder;
  updateReminder: typeof updateReminder;
  setReminderCompleted: typeof setReminderCompleted;
  deleteReminder: typeof deleteReminder;
  resetStudyData: typeof resetStudyData;
}

export const StudyDataContext = createContext<StudyDataContextValue | null>(null);

export function useStudyData(): StudyDataContextValue {
  const context = useContext(StudyDataContext);
  if (!context) throw new Error("useStudyData must be used within a StudyDataProvider.");
  return context;
}
