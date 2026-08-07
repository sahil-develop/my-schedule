'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { useUpsertGoal } from '@/hooks/useGoals';
import { errorMessage } from '@/lib/api';
import type { MonthlyGoal } from '@/types';

const schema = z.object({
  dsaTarget: z.number().min(0),
  jobApplicationsTarget: z.number().min(0),
  learningHoursTarget: z.number().min(0),
  revisionHoursTarget: z.number().min(0),
  interviewPrepHoursTarget: z.number().min(0),
  projectHoursTarget: z.number().min(0),
});
type FormValues = z.infer<typeof schema>;

interface GoalsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: MonthlyGoal;
  month: number;
  year: number;
}

export function GoalsFormDialog({ open, onOpenChange, goal, month, year }: GoalsFormDialogProps) {
  const upsertGoal = useUpsertGoal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: goal });

  useEffect(() => {
    if (open) reset(goal);
  }, [open, goal, reset]);

  async function onSubmit(values: FormValues) {
    try {
      await upsertGoal.mutateAsync({ ...values, month, year });
      toast.success('Monthly goals updated');
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit monthly goals</DialogTitle>
          <DialogDescription>Set your targets for this month. You can change these anytime.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dsaTarget">DSA Problems</Label>
              <Input id="dsaTarget" type="number" min={0} {...register('dsaTarget', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jobApplicationsTarget">Job Applications</Label>
              <Input id="jobApplicationsTarget" type="number" min={0} {...register('jobApplicationsTarget', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="learningHoursTarget">Learning Hours</Label>
              <Input id="learningHoursTarget" type="number" min={0} {...register('learningHoursTarget', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="revisionHoursTarget">Revision Hours</Label>
              <Input id="revisionHoursTarget" type="number" min={0} {...register('revisionHoursTarget', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interviewPrepHoursTarget">Interview Prep Hours</Label>
              <Input id="interviewPrepHoursTarget" type="number" min={0} {...register('interviewPrepHoursTarget', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="projectHoursTarget">Project Work Hours</Label>
              <Input id="projectHoursTarget" type="number" min={0} {...register('projectHoursTarget', { valueAsNumber: true })} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save goals
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
