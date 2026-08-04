import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DsaStats } from './useDsa';
import type { JobStats } from './useJobs';
import type { LearningItem, MonthlyGoal, GoalActuals } from '@/types';

export function useCategoryReport(start: string, end: string) {
  return useQuery({
    queryKey: ['reports', 'category', start, end],
    queryFn: async () =>
      (
        await api.get<{
          start: string;
          end: string;
          totalHours: number;
          breakdown: { bucket: string; color: string; hours: number; taskCount: number; percentOfTotal: number }[];
        }>('/reports/category', { params: { start, end } })
      ).data,
  });
}

export function useCareerReport(month: number, year: number) {
  return useQuery({
    queryKey: ['reports', 'career', month, year],
    queryFn: async () =>
      (
        await api.get<{ dsa: DsaStats; jobs: JobStats; goal: MonthlyGoal; actuals: GoalActuals }>('/reports/career', {
          params: { month, year },
        })
      ).data,
  });
}

export function useLearningReport() {
  return useQuery({
    queryKey: ['reports', 'learning'],
    queryFn: async () =>
      (
        await api.get<{
          items: LearningItem[];
          totalPlannedHours: number;
          totalCompletedHours: number;
          overallProgress: number;
        }>('/reports/learning')
      ).data,
  });
}
