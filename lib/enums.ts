export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum DsaStatus {
  NOT_STARTED = 'NOT_STARTED',
  SOLVED = 'SOLVED',
  NEEDS_REVISION = 'NEEDS_REVISION',
  RE_SOLVED = 'RE_SOLVED',
}

export enum JobStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  HR = 'HR',
  TECHNICAL_ROUND = 'TECHNICAL_ROUND',
  FINAL_ROUND = 'FINAL_ROUND',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  GHOSTED = 'GHOSTED',
}

export enum LearningStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

export enum NotificationType {
  TASK_REMINDER = 'TASK_REMINDER',
  FOLLOWUP_DUE = 'FOLLOWUP_DUE',
  GOAL_ALERT = 'GOAL_ALERT',
  GENERAL = 'GENERAL',
}

// Category name -> which "bucket" it rolls up into for DailySummary aggregation
export enum CategoryBucket {
  DSA = 'DSA',
  JOB = 'JOB',
  LEARNING = 'LEARNING',
  REVISION = 'REVISION',
  PROJECT = 'PROJECT',
  EXERCISE = 'EXERCISE',
  INTERVIEW_PREP = 'INTERVIEW_PREP',
  OTHER = 'OTHER',
}

// Buckets that count toward "focus hours" KPIs — breaks and personal/exercise
// time are shown on the timeline but excluded from planned/completed totals,
// matching the spec's "Planned: 8h" example (which only sums the work blocks).
export const FOCUS_BUCKETS: string[] = [
  CategoryBucket.DSA,
  CategoryBucket.JOB,
  CategoryBucket.LEARNING,
  CategoryBucket.REVISION,
  CategoryBucket.PROJECT,
  CategoryBucket.INTERVIEW_PREP,
];

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  color: string;
  icon: string;
  bucket: CategoryBucket;
}> = [
  { name: 'DSA Preparation', color: '#6366f1', icon: 'brain-circuit', bucket: CategoryBucket.DSA },
  { name: 'Backend / New Skill Learning', color: '#3b82f6', icon: 'book-open', bucket: CategoryBucket.LEARNING },
  { name: 'Job Applications / Career', color: '#8b5cf6', icon: 'briefcase', bucket: CategoryBucket.JOB },
  { name: 'Revision / Project Work', color: '#10b981', icon: 'refresh-cw', bucket: CategoryBucket.PROJECT },
  { name: 'Exercise / Personal Time', color: '#f59e0b', icon: 'dumbbell', bucket: CategoryBucket.EXERCISE },
  { name: 'Interview Preparation', color: '#ec4899', icon: 'message-square', bucket: CategoryBucket.INTERVIEW_PREP },
  { name: 'Break', color: '#94a3b8', icon: 'coffee', bucket: CategoryBucket.OTHER },
];
