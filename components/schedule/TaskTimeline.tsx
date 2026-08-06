'use client';

import { useState } from 'react';
import { Play, Square, Pencil, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStartTimer, useStopTimer, useDeleteTask } from '@/hooks/useTasks';
import { PRIORITY_STYLES, TASK_STATUS_STYLES, labelize } from '@/lib/badges';
import { formatMinutes, cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import type { DailyTask } from '@/types';

interface TaskTimelineProps {
  tasks: DailyTask[];
  currentTaskId?: string | null;
  onEdit: (task: DailyTask) => void;
  emptyContent?: React.ReactNode;
}

export function TaskTimeline({ tasks, currentTaskId, onEdit, emptyContent }: TaskTimelineProps) {
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const deleteTask = useDeleteTask();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (tasks.length === 0) {
    return <>{emptyContent}</>;
  }

  async function toggleTimer(task: DailyTask) {
    try {
      if (task.isTimerRunning) {
        await stopTimer.mutateAsync(task.id);
      } else {
        await startTimer.mutateAsync(task.id);
        toast.success(`Timer started for "${task.title}"`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    setPendingDelete(id);
    try {
      await deleteTask.mutateAsync(id);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="relative space-y-3">
      {tasks.map((task) => {
        const isCurrent = task.id === currentTaskId;
        const progressPercent = task.plannedMinutes
          ? Math.min(100, Math.round((task.actualMinutes / task.plannedMinutes) * 100))
          : 0;

        return (
          <div
            key={task.id}
            className={cn(
              'group relative flex flex-col gap-3 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center',
              isCurrent
                ? 'border-primary/40 bg-primary/[0.04] shadow-sm ring-1 ring-primary/20'
                : 'border-border bg-card hover:border-border/80',
            )}
          >
            <div
              className="flex w-full shrink-0 flex-col items-start gap-0.5 text-sm font-medium sm:w-28"
              style={{ color: task.category?.color }}
            >
              <span className="text-foreground">
                {task.startTime} – {task.endTime}
              </span>
              <span className="text-xs font-normal text-muted-foreground">{formatMinutes(task.plannedMinutes)} planned</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {isCurrent && (
                  <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" /> Now
                  </span>
                )}
                <p className="truncate font-medium">{task.title}</p>
                {task.category && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: `${task.category.color}1a`, color: task.category.color }}
                  >
                    {task.category.name}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={TASK_STATUS_STYLES[task.status]}>{labelize(task.status)}</Badge>
                <Badge variant={PRIORITY_STYLES[task.priority]}>{labelize(task.priority)} priority</Badge>
                {task.actualMinutes > 0 && (
                  <span className="text-xs text-muted-foreground">{formatMinutes(task.actualMinutes)} logged</span>
                )}
              </div>
              {(task.actualMinutes > 0 || task.isTimerRunning) && (
                <Progress value={progressPercent} className="mt-2.5 h-1.5 max-w-xs" />
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
              <Button
                size="sm"
                variant={task.isTimerRunning ? 'destructive' : 'secondary'}
                onClick={() => toggleTimer(task)}
                disabled={startTimer.isPending || stopTimer.isPending}
              >
                {task.isTimerRunning ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {task.isTimerRunning ? 'Stop' : 'Start'}
              </Button>
              <Button size="iconSm" variant="ghost" onClick={() => onEdit(task)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="iconSm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(task.id)}
                disabled={pendingDelete === task.id}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {task.isTimerRunning && (
              <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Clock className="h-3 w-3 animate-pulse" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
