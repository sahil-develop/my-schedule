import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GoalActuals, MonthlyGoal } from '@/types';

export function useMonthlyGoal(month: number, year: number) {
  return useQuery({
    queryKey: ['goals', month, year],
    queryFn: async () =>
      (await api.get<{ goal: MonthlyGoal; actuals: GoalActuals }>('/goals', { params: { month, year } })).data,
  });
}

export function useUpsertGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<MonthlyGoal> & { month: number; year: number }) => api.post('/goals', values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}
