import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DsaProblem } from '@/types';

export interface DsaStats {
  totalSolved: number;
  solvedToday: number;
  solvedThisWeek: number;
  solvedThisMonth: number;
  easy: number;
  medium: number;
  hard: number;
  revisionPending: number;
}

export type DsaFormValues = Omit<DsaProblem, 'id'>;

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['dsa'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['reports'] });
  queryClient.invalidateQueries({ queryKey: ['goals'] });
}

export function useDsaProblems() {
  return useQuery({ queryKey: ['dsa', 'list'], queryFn: async () => (await api.get<DsaProblem[]>('/dsa')).data });
}

export function useDsaStats() {
  return useQuery({
    queryKey: ['dsa', 'stats'],
    queryFn: async () => (await api.get<DsaStats>('/dsa/stats')).data,
  });
}

export function useCreateDsa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: DsaFormValues) => api.post('/dsa', values),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateDsa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<DsaFormValues> }) => api.patch(`/dsa/${id}`, values),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteDsa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/dsa/${id}`),
    onSuccess: () => invalidate(queryClient),
  });
}
