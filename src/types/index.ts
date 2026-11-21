export type AssignmentPriority = "Low" | "Medium" | "High";
export type AssignmentStatus = "Pending" | "In Progress" | "Completed";

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Subject {
  subjectId: string;
  userId?: string;
  subjectName: string;
  subjectCode?: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Assignment {
  assignmentId: string;
  userId?: string;
  subjectId: string | null;
  title: string;
  description: string;
  dueDate: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  createdAt: string;
}

export interface Reminder {
  reminderId: string;
  userId?: string;
  title: string;
  description: string;
  reminderDate: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface StudyData {
  subjects: Subject[];
  assignments: Assignment[];
  reminders: Reminder[];
}
