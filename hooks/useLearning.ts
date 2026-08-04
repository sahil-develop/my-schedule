import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LearningItem } from '@/types';

export type LearningFormValues = Omit<LearningItem, 'id'>;

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['learning'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['reports'] });
}

export function useLearningItems() {
  return useQuery({
    queryKey: ['learning', 'list'],
    queryFn: async () => (await api.get<LearningItem[]>('/learning')).data,
  });
}

export function useCreateLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LearningFormValues) => api.post('/learning', values),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<LearningFormValues> }) =>
      api.patch(`/learning/${id}`, values),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/learning/${id}`),
    onSuccess: () => invalidate(queryClient),
  });
}
