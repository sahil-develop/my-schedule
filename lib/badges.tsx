import type { BadgeProps } from '@/components/ui/badge';

export const PRIORITY_STYLES: Record<string, BadgeProps['variant']> = {
  LOW: 'secondary',
  MEDIUM: 'accent',
  HIGH: 'warning',
  URGENT: 'destructive',
};

export const TASK_STATUS_STYLES: Record<string, BadgeProps['variant']> = {
  PENDING: 'secondary',
  IN_PROGRESS: 'accent',
  COMPLETED: 'success',
  SKIPPED: 'outline',
};

export const DSA_STATUS_STYLES: Record<string, BadgeProps['variant']> = {
  NOT_STARTED: 'secondary',
  SOLVED: 'success',
  NEEDS_REVISION: 'warning',
  RE_SOLVED: 'accent',
};

export const DIFFICULTY_STYLES: Record<string, BadgeProps['variant']> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
};

export const JOB_STATUS_STYLES: Record<string, BadgeProps['variant']> = {
  APPLIED: 'secondary',
  SCREENING: 'accent',
  HR: 'accent',
  TECHNICAL_ROUND: 'warning',
  FINAL_ROUND: 'warning',
  OFFER: 'success',
  REJECTED: 'destructive',
  GHOSTED: 'outline',
};

export const LEARNING_STATUS_STYLES: Record<string, BadgeProps['variant']> = {
  NOT_STARTED: 'secondary',
  IN_PROGRESS: 'accent',
  COMPLETED: 'success',
  PAUSED: 'outline',
};

export function labelize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export const BUCKET_COLORS: Record<string, string> = {
  DSA: '#6366f1',
  JOB: '#8b5cf6',
  LEARNING: '#3b82f6',
  REVISION: '#10b981',
  PROJECT: '#10b981',
  EXERCISE: '#f59e0b',
  INTERVIEW_PREP: '#ec4899',
  OTHER: '#94a3b8',
};

export const BUCKET_LABELS: Record<string, string> = {
  DSA: 'DSA Prep',
  JOB: 'Job Applications',
  LEARNING: 'Learning',
  REVISION: 'Revision',
  PROJECT: 'Project Work',
  EXERCISE: 'Exercise',
  INTERVIEW_PREP: 'Interview Prep',
  OTHER: 'Other',
};
