'use client';

import { useState } from 'react';
import { Plus, Briefcase, CalendarDays, MessageSquare, Award, Bell, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useJobs, useJobStats, useDeleteJob } from '@/hooks/useJobs';
import { JobFormDialog } from '@/components/jobs/JobFormDialog';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { JOB_STATUS_STYLES, labelize } from '@/lib/badges';
import { errorMessage } from '@/lib/api';
import type { JobApplication } from '@/types';

export default function JobsPage() {
  const { data: jobs, isLoading } = useJobs();
  const { data: stats } = useJobStats();
  const deleteJob = useDeleteJob();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(job: JobApplication) {
    setEditing(job);
    setDialogOpen(true);
  }
  async function handleDelete(id: string) {
    try {
      await deleteJob.mutateAsync(id);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job Applications</h1>
          <p className="text-sm text-muted-foreground">Your career CRM — track every opportunity.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {!stats ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatCard label="Today" value={stats.appliedToday} icon={CalendarDays} accent="blue" />
            <StatCard label="This Week" value={stats.appliedThisWeek} icon={CalendarDays} accent="indigo" />
            <StatCard label="This Month" value={stats.appliedThisMonth} icon={Briefcase} accent="violet" />
            <StatCard label="Interviews" value={stats.interviews} icon={MessageSquare} accent="amber" />
            <StatCard label="Offers" value={stats.offers} icon={Award} accent="emerald" />
            <StatCard label="Pending Follow-ups" value={stats.pendingFollowUps} icon={Bell} accent="rose" />
          </>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !jobs?.length ? (
            <div className="p-6">
              <EmptyState
                icon={Briefcase}
                title="No applications yet"
                description="Add your first job application to start tracking your pipeline."
                actionLabel="Add Application"
                onAction={openAdd}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Company / Role</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Applied</th>
                    <th className="px-5 py-3 font-medium">Follow-up</th>
                    <th className="px-5 py-3 font-medium">CTC</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium">{job.company}</p>
                          {job.jobUrl && (
                            <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{job.role}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={JOB_STATUS_STYLES[job.status]}>{labelize(job.status)}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{job.dateApplied.slice(0, 10)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{job.followUpDate?.slice(0, 10) ?? '—'}</td>
                      <td className="px-5 py-3 text-muted-foreground">{job.expectedCtc ?? '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="iconSm" variant="ghost" onClick={() => openEdit(job)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="iconSm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(job.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <JobFormDialog open={dialogOpen} onOpenChange={setDialogOpen} job={editing} />
    </div>
  );
}
