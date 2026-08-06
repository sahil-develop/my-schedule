'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { errorMessage } from '@/lib/api';
import { labelize } from '@/lib/badges';
import type { DailyTask } from '@/types';

const schema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    date: z.string().min(1),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm'),
    categoryId: z.string().optional(),
    priority: z.string(),
    status: z.string(),
    notes: z.string().optional(),
  })
  .refine((v) => v.startTime < v.endTime, { message: 'End time must be after start time', path: ['endTime'] });

type FormValues = z.infer<typeof schema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  task?: DailyTask | null;
}

export function TaskFormDialog({ open, onOpenChange, defaultDate, task }: TaskFormDialogProps) {
  const { data: categories } = useCategories();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      date: defaultDate,
      startTime: '09:00',
      endTime: '10:00',
      priority: 'MEDIUM',
      status: 'PENDING',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              date: task.date.slice(0, 10),
              startTime: task.startTime,
              endTime: task.endTime,
              categoryId: task.categoryId ?? undefined,
              priority: task.priority,
              status: task.status,
              notes: task.notes ?? '',
            }
          : {
              title: '',
              date: defaultDate,
              startTime: '09:00',
              endTime: '10:00',
              priority: 'MEDIUM',
              status: 'PENDING',
              notes: '',
            },
      );
    }
  }, [open, task, defaultDate, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && task) {
        await updateTask.mutateAsync({ id: task.id, values });
        toast.success('Task updated');
      } else {
        await createTask.mutateAsync(values);
        toast.success('Task added');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit task' : 'Add task'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details of this schedule item.' : 'Adding a task takes just a few seconds.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Task</Label>
            <Input id="title" placeholder="e.g. DSA Preparation" {...register('title')} autoFocus />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Start</Label>
              <Input id="startTime" type="time" {...register('startTime')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime">End</Label>
              <Input id="endTime" type="time" {...register('endTime')} />
              {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                        <SelectItem key={p} value={p}>
                          {labelize(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'].map((s) => (
                        <SelectItem key={s} value={s}>
                          {labelize(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional notes..." rows={2} {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Add task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
