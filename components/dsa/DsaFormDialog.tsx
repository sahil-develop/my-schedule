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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDsa, useUpdateDsa } from '@/hooks/useDsa';
import { errorMessage } from '@/lib/api';
import { labelize } from '@/lib/badges';
import type { DsaProblem } from '@/types';

const schema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  problem: z.string().min(1, 'Problem name is required'),
  difficulty: z.string(),
  platform: z.string().optional(),
  date: z.string().min(1),
  timeSpentMinutes: z.number().min(0),
  status: z.string(),
  revisionRequired: z.boolean(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface DsaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem?: DsaProblem | null;
}

export function DsaFormDialog({ open, onOpenChange, problem }: DsaFormDialogProps) {
  const createDsa = useCreateDsa();
  const updateDsa = useUpdateDsa();
  const isEdit = !!problem;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      topic: '',
      problem: '',
      difficulty: 'MEDIUM',
      platform: '',
      date: new Date().toISOString().slice(0, 10),
      timeSpentMinutes: 30,
      status: 'SOLVED',
      revisionRequired: false,
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        problem
          ? {
              topic: problem.topic,
              problem: problem.problem,
              difficulty: problem.difficulty,
              platform: problem.platform ?? '',
              date: problem.date.slice(0, 10),
              timeSpentMinutes: problem.timeSpentMinutes,
              status: problem.status,
              revisionRequired: problem.revisionRequired,
              notes: problem.notes ?? '',
            }
          : {
              topic: '',
              problem: '',
              difficulty: 'MEDIUM',
              platform: '',
              date: new Date().toISOString().slice(0, 10),
              timeSpentMinutes: 30,
              status: 'SOLVED',
              revisionRequired: false,
              notes: '',
            },
      );
    }
  }, [open, problem, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && problem) {
        await updateDsa.mutateAsync({ id: problem.id, values: values as any });
        toast.success('Problem updated');
      } else {
        await createDsa.mutateAsync(values as any);
        toast.success('Problem logged');
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
          <DialogTitle>{isEdit ? 'Edit problem' : 'Log a DSA problem'}</DialogTitle>
          <DialogDescription>Track what you solved and whether it needs revision.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" placeholder="e.g. Dynamic Programming" {...register('topic')} autoFocus />
              {errors.topic && <p className="text-xs text-destructive">{errors.topic.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="problem">Problem</Label>
              <Input id="problem" placeholder="e.g. Longest Increasing Subsequence" {...register('problem')} />
              {errors.problem && <p className="text-xs text-destructive">{errors.problem.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                        <SelectItem key={d} value={d}>
                          {labelize(d)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="platform">Platform</Label>
              <Input id="platform" placeholder="LeetCode" {...register('platform')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="timeSpentMinutes">Time spent (min)</Label>
              <Input id="timeSpentMinutes" type="number" min={0} {...register('timeSpentMinutes', { valueAsNumber: true })} />
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
                      {['NOT_STARTED', 'SOLVED', 'NEEDS_REVISION', 'RE_SOLVED'].map((s) => (
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

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <Label htmlFor="revisionRequired">Needs revision</Label>
              <p className="text-xs text-muted-foreground">Flag this to revisit later</p>
            </div>
            <Controller
              control={control}
              name="revisionRequired"
              render={({ field }) => <Switch id="revisionRequired" checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Approach, complexity, gotchas..." rows={2} {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Log problem'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
