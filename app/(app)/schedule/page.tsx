'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Sparkles, CalendarDays } from 'lucide-react';
import { useTodayView } from '@/hooks/useDashboard';
import { useGeneratePlan } from '@/hooks/useTasks';
import { TaskTimeline } from '@/components/schedule/TaskTimeline';
import { TaskFormDialog } from '@/components/schedule/TaskFormDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateLabel, formatMinutes, todayIso } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import type { DailyTask } from '@/types';

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function SchedulePage() {
  const [date, setDate] = useState(todayIso());
  const [targetHours, setTargetHours] = useState('8');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  const { data: view, isLoading } = useTodayView(date);
  const generatePlan = useGeneratePlan();

  function openAddTask() {
    setEditingTask(null);
    setTaskDialogOpen(true);
  }
  function openEditTask(task: DailyTask) {
    setEditingTask(task);
    setTaskDialogOpen(true);
  }

  async function handleGeneratePlan(force = false) {
    try {
      const res = await generatePlan.mutateAsync({ date, targetHours: Number(targetHours), force });
      toast.success(`Generated ${res.data.created.length} schedule blocks for ${targetHours}h`);
      if (res.data.carriedOver.length) {
        toast.info(`${res.data.carriedOver.length} overdue high-priority task(s) carried over — check them first`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const isToday = date === todayIso();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
          <p className="text-sm text-muted-foreground">Plan, track, and time-box your day.</p>
        </div>
        <Button onClick={openAddTask}>
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setDate((d) => shiftDate(d, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
            </div>
            <Button variant="outline" size="icon" onClick={() => setDate((d) => shiftDate(d, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {!isToday && (
              <Button variant="ghost" size="sm" onClick={() => setDate(todayIso())}>
                Today
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={targetHours} onValueChange={setTargetHours}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="7">7 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="9">9 hours</SelectItem>
                <SelectItem value="10">10 hours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={() => handleGeneratePlan(false)} disabled={generatePlan.isPending}>
              <Sparkles className="h-4 w-4" /> Generate Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{formatDateLabel(date)}</CardTitle>
          <CardDescription>
            {view?.tasks.length
              ? `Planned ${formatMinutes(view.plannedMinutes)} · Completed ${formatMinutes(view.completedMinutes)} · ${view.completionPercent}% done`
              : 'No tasks scheduled'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <TaskTimeline
              tasks={view?.tasks ?? []}
              currentTaskId={view?.current?.id}
              onEdit={openEditTask}
              emptyContent={
                <EmptyState
                  icon={Sparkles}
                  title="Nothing scheduled for this day"
                  description="Generate a default focus schedule or add a task manually."
                  actionLabel="Generate Plan"
                  onAction={() => handleGeneratePlan(false)}
                />
              }
            />
          )}
        </CardContent>
      </Card>

      <TaskFormDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} defaultDate={date} task={editingTask} />
    </div>
  );
}
