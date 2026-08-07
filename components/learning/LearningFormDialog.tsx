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
import { useCreateLearning, useUpdateLearning } from '@/hooks/useLearning';
import { errorMessage } from '@/lib/api';
import { labelize } from '@/lib/badges';
import type { LearningItem } from '@/types';

const schema = z.object({
  skill: z.string().min(1, 'Skill is required'),
  topic: z.string().optional(),
  plannedHours: z.number().min(0),
  completedHours: z.number().min(0),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  status: z.string(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface LearningFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: LearningItem | null;
}

export function LearningFormDialog({ open, onOpenChange, item }: LearningFormDialogProps) {
  const createLearning = useCreateLearning();
  const updateLearning = useUpdateLearning();
  const isEdit = !!item;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { skill: '', plannedHours: 20, completedHours: 0, status: 'NOT_STARTED' },
  });

  useEffect(() => {
    if (open) {
      reset(
        item
          ? {
              skill: item.skill,
              topic: item.topic ?? '',
              plannedHours: item.plannedHours,
              completedHours: item.completedHours,
              startDate: item.startDate?.slice(0, 10) ?? '',
              targetDate: item.targetDate?.slice(0, 10) ?? '',
              status: item.status,
              notes: item.notes ?? '',
            }
          : { skill: '', plannedHours: 20, completedHours: 0, status: 'NOT_STARTED' },
      );
    }
  }, [open, item, reset]);

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      startDate: values.startDate || undefined,
      targetDate: values.targetDate || undefined,
    };
    try {
      if (isEdit && item) {
        await updateLearning.mutateAsync({ id: item.id, values: payload as any });
        toast.success('Learning item updated');
      } else {
        await createLearning.mutateAsync(payload as any);
        toast.success('Learning item added');
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
          <DialogTitle>{isEdit ? 'Edit learning item' : 'Add a skill to learn'}</DialogTitle>
          <DialogDescription>Track progress on a new skill or technology.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="skill">Skill</Label>
              <Input id="skill" placeholder="e.g. NestJS" {...register('skill')} autoFocus />
              {errors.skill && <p className="text-xs text-destructive">{errors.skill.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" placeholder="e.g. Modules & DI" {...register('topic')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plannedHours">Planned Hours</Label>
              <Input id="plannedHours" type="number" min={0} step="0.5" {...register('plannedHours', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="completedHours">Completed Hours</Label>
              <Input id="completedHours" type="number" min={0} step="0.5" {...register('completedHours', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input id="targetDate" type="date" {...register('targetDate')} />
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
                      {['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED'].map((s) => (
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
            <Textarea id="notes" placeholder="Resources, plan, milestones..." rows={2} {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Add item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
