export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type DsaStatus = 'NOT_STARTED' | 'SOLVED' | 'NEEDS_REVISION' | 'RE_SOLVED';
export type JobStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'HR'
  | 'TECHNICAL_ROUND'
  | 'FINAL_ROUND'
  | 'OFFER'
  | 'REJECTED'
  | 'GHOSTED';
export type LearningStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
export type NotificationType = 'TASK_REMINDER' | 'FOLLOWUP_DUE' | 'GOAL_ALERT' | 'GENERAL';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  bucket: string;
  isDefault: boolean;
}

export interface DailyTask {
  id: string;
  userId: string;
  categoryId: string | null;
  category: Category | null;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  plannedMinutes: number;
  actualMinutes: number;
  priority: Priority;
  status: TaskStatus;
  notes: string | null;
  isTimerRunning: boolean;
  timerStartedAt: string | null;
}

export interface DsaProblem {
  id: string;
  topic: string;
  problem: string;
  difficulty: Difficulty;
  platform: string | null;
  date: string;
  timeSpentMinutes: number;
  status: DsaStatus;
  revisionRequired: boolean;
  notes: string | null;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  dateApplied: string;
  location: string | null;
  jobUrl: string | null;
  experience: string | null;
  expectedCtc: string | null;
  status: JobStatus;
  followUpDate: string | null;
  interviewDate: string | null;
  notes: string | null;
}

export interface LearningItem {
  id: string;
  skill: string;
  topic: string | null;
  plannedHours: number;
  completedHours: number;
  startDate: string | null;
  targetDate: string | null;
  status: LearningStatus;
  notes: string | null;
}

export interface MonthlyGoal {
  id: string;
  month: number;
  year: number;
  dsaTarget: number;
  jobApplicationsTarget: number;
  learningHoursTarget: number;
  revisionHoursTarget: number;
  interviewPrepHoursTarget: number;
  projectHoursTarget: number;
}

export interface GoalActuals {
  dsaActual: number;
  jobApplicationsActual: number;
  learningHoursActual: number;
  revisionHoursActual: number;
  interviewPrepHoursActual: number;
  projectHoursActual: number;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedTaskId: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  todayFocusHours: number;
  todayCompletedHours: number;
  todayCompletionPercent: number;
  weeklyFocusHours: number;
  monthlyFocusHours: number;
  dsaProblemsSolved: number;
  jobApplications: number;
  interviews: number;
  learningProgress: number;
}

export interface TodayView {
  date: string;
  tasks: DailyTask[];
  current: (DailyTask & { progressPercent: number }) | null;
  upNext: DailyTask | null;
  plannedMinutes: number;
  completedMinutes: number;
  completionPercent: number;
}

export interface WeeklyDay {
  date: string;
  label: string;
  plannedHours: number;
  completedHours: number;
  completionPercent: number;
  dsaHours: number;
  jobHours: number;
  learningHours: number;
}

export interface WeeklyView {
  weekStart: string;
  days: WeeklyDay[];
  categoryBreakdown: { bucket: string; hours: number }[];
}

export interface MonthlyDay {
  date: string;
  focusHours: number;
  completionPercent: number;
  taskCount: number;
}

export interface MonthlyView {
  month: number;
  year: number;
  calendar: MonthlyDay[];
  stats: {
    totalFocusHours: number;
    avgDailyHours: number;
    dsaHours: number;
    jobHours: number;
    revisionHours: number;
    learningHours: number;
    projectHours: number;
    completionRate: number;
    bestProductivityDay: string | null;
  };
}
