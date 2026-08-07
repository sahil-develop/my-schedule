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
import { useCreateJob, useUpdateJob } from '@/hooks/useJobs';
import { errorMessage } from '@/lib/api';
import { labelize } from '@/lib/badges';
import type { JobApplication } from '@/types';

const JOB_STATUSES = ['APPLIED', 'SCREENING', 'HR', 'TECHNICAL_ROUND', 'FINAL_ROUND', 'OFFER', 'REJECTED', 'GHOSTED'];

const schema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  dateApplied: z.string().min(1),
  location: z.string().optional(),
  jobUrl: z.string().optional(),
  experience: z.string().optional(),
  expectedCtc: z.string().optional(),
  status: z.string(),
  followUpDate: z.string().optional(),
  interviewDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobApplication | null;
}

export function JobFormDialog({ open, onOpenChange, job }: JobFormDialogProps) {
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const isEdit = !!job;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: '',
      role: '',
      dateApplied: new Date().toISOString().slice(0, 10),
      status: 'APPLIED',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        job
          ? {
              company: job.company,
              role: job.role,
              dateApplied: job.dateApplied.slice(0, 10),
              location: job.location ?? '',
              jobUrl: job.jobUrl ?? '',
              experience: job.experience ?? '',
              expectedCtc: job.expectedCtc ?? '',
              status: job.status,
              followUpDate: job.followUpDate?.slice(0, 10) ?? '',
              interviewDate: job.interviewDate?.slice(0, 10) ?? '',
              notes: job.notes ?? '',
            }
          : {
              company: '',
              role: '',
              dateApplied: new Date().toISOString().slice(0, 10),
              status: 'APPLIED',
            },
      );
    }
  }, [open, job, reset]);

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      followUpDate: values.followUpDate || undefined,
      interviewDate: values.interviewDate || undefined,
    };
    try {
      if (isEdit && job) {
        await updateJob.mutateAsync({ id: job.id, values: payload as any });
        toast.success('Application updated');
      } else {
        await createJob.mutateAsync(payload as any);
        toast.success('Application added');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit application' : 'Add job application'}</DialogTitle>
          <DialogDescription>Keep your career pipeline organized.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="e.g. Acme Corp" {...register('company')} autoFocus />
              {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="e.g. Backend Engineer" {...register('role')} />
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input id="dateApplied" type="date" {...register('dateApplied')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Remote" {...register('location')} />
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
                      {JOB_STATUSES.map((s) => (
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="experience">Experience</Label>
              <Input id="experience" placeholder="e.g. 3 years" {...register('experience')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expectedCtc">Expected CTC</Label>
              <Input id="expectedCtc" placeholder="e.g. 18 LPA" {...register('expectedCtc')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input id="jobUrl" placeholder="https://..." {...register('jobUrl')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input id="followUpDate" type="date" {...register('followUpDate')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interviewDate">Interview Date</Label>
              <Input id="interviewDate" type="date" {...register('interviewDate')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Recruiter contact, interview notes..." rows={2} {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Add application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
