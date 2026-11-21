"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { StudyDataContext } from "@/providers/study-data-context";
import {
  addAssignment,
  addReminder,
  addSubject,
  deleteAssignment,
  deleteReminder,
  deleteSubject,
  getStudyDataSnapshot,
  getStudyDataServerSnapshot,
  resetStudyData,
  setReminderCompleted,
  subscribeToStudyData,
  updateAssignment,
  updateReminder,
  updateSubject,
} from "@/lib/study-data-store";

export function StudyDataProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeToStudyData,
    getStudyDataSnapshot,
    getStudyDataServerSnapshot,
  );

  return (
    <StudyDataContext.Provider
      value={{
        ...snapshot,
        addSubject,
        updateSubject,
        deleteSubject,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addReminder,
        updateReminder,
        setReminderCompleted,
        deleteReminder,
        resetStudyData,
      }}
    >
      {children}
    </StudyDataContext.Provider>
  );
}
