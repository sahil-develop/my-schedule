import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { JobApplication } from '@/types';

export interface JobStats {
  appliedToday: number;
  appliedThisWeek: number;
  appliedThisMonth: number;
  totalApplications: number;
  interviews: number;
  offers: number;
  pendingFollowUps: number;
}

export type JobFormValues = Omit<JobApplication, 'id'>;

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['jobs'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['reports'] });
  queryClient.invalidateQueries({ queryKey: ['goals'] });
}

export function useJobs() {
  return useQuery({
    queryKey: ['jobs', 'list'],
    queryFn: async () => (await api.get<JobApplication[]>('/jobs')).data,
  });
}

export function useJobStats() {
  return useQuery({
    queryKey: ['jobs', 'stats'],
    queryFn: async () => (await api.get<JobStats>('/jobs/stats')).data,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: JobFormValues) => api.post('/jobs', values),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<JobFormValues> }) => api.patch(`/jobs/${id}`, values),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/jobs/${id}`),
    onSuccess: () => invalidate(queryClient),
  });
}
