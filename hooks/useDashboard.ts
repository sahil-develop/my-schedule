import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardSummary, MonthlyView, TodayView, WeeklyView } from '@/types';

export function useTodayView(date: string) {
  return useQuery({
    queryKey: ['dashboard', 'today', date],
    queryFn: async () => (await api.get<TodayView>('/dashboard/today', { params: { date } })).data,
    refetchInterval: 60_000,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => (await api.get<DashboardSummary>('/dashboard/summary')).data,
    refetchInterval: 60_000,
  });
}

export function useWeeklyView(date: string) {
  return useQuery({
    queryKey: ['dashboard', 'weekly', date],
    queryFn: async () => (await api.get<WeeklyView>('/dashboard/weekly', { params: { date } })).data,
  });
}

export function useMonthlyView(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', 'monthly', month, year],
    queryFn: async () => (await api.get<MonthlyView>('/dashboard/monthly', { params: { month, year } })).data,
  });
}
