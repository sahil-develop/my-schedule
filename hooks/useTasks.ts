import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DailyTask } from '@/types';

// Any change to a task ripples into the dashboard, weekly/monthly reports,
// and goal actuals — invalidate all of them together so the UI never shows
// stale numbers after an edit.
function invalidateEverything(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['reports'] });
  queryClient.invalidateQueries({ queryKey: ['goals'] });
}

export function useTasksByDate(date: string) {
  return useQuery({
    queryKey: ['tasks', 'day', date],
    queryFn: async () => (await api.get<DailyTask[]>('/tasks', { params: { date } })).data,
  });
}

export interface TaskFormValues {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  categoryId?: string | null;
  priority?: string;
  status?: string;
  notes?: string;
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: TaskFormValues) => api.post<DailyTask>('/tasks', values),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<TaskFormValues> }) =>
      api.patch<DailyTask>(`/tasks/${id}`, values),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export function useStartTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<DailyTask>(`/tasks/${id}/timer/start`),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export function useStopTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<DailyTask>(`/tasks/${id}/timer/stop`),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export interface GeneratePlanResult {
  created: DailyTask[];
  carriedOver: DailyTask[];
  targetHours: number;
  plannedMinutes: number;
}

export function useGeneratePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: { date: string; targetHours?: number; force?: boolean }) =>
      api.post<GeneratePlanResult>('/tasks/generate-plan', values),
    onSuccess: () => invalidateEverything(queryClient),
  });
}
