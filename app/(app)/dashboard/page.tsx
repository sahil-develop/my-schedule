'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  CalendarRange,
  CalendarDays,
  BrainCircuit,
  Briefcase,
  MessageSquare,
  GraduationCap,
  Plus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTodayView, useDashboardSummary, useWeeklyView } from '@/hooks/useDashboard';
import { useGeneratePlan } from '@/hooks/useTasks';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { TaskTimeline } from '@/components/schedule/TaskTimeline';
import { TaskFormDialog } from '@/components/schedule/TaskFormDialog';
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart';
import { CategoryDonut } from '@/components/dashboard/CategoryDonut';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateLabel, formatMinutes, todayIso } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import type { DailyTask } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const today = todayIso();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  const { data: todayView, isLoading: todayLoading } = useTodayView(today);
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyView(today);
  const generatePlan = useGeneratePlan();

  function openAddTask() {
    setEditingTask(null);
    setTaskDialogOpen(true);
  }
  function openEditTask(task: DailyTask) {
    setEditingTask(task);
    setTaskDialogOpen(true);
  }

  async function handleGeneratePlan(targetHours = 8) {
    try {
      const res = await generatePlan.mutateAsync({ date: today, targetHours });
      toast.success(`Generated your ${res.data.targetHours}h plan for today`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const plannedHours = todayView ? todayView.plannedMinutes / 60 : 0;
  const completedHours = todayView ? todayView.completedMinutes / 60 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">{formatDateLabel(today)}</p>
        </div>
        <Button onClick={openAddTask}>
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Hero: today's focus */}
      <Card className="overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-100">Today's Focus</p>
            {todayLoading ? (
              <div className="mt-2 h-9 w-40 animate-pulse rounded-lg bg-white/20" />
            ) : (
              <p className="mt-1 text-4xl font-bold tracking-tight">
                {completedHours.toFixed(1)}h <span className="text-xl font-medium text-indigo-100">/ {plannedHours.toFixed(0)}h</span>
              </p>
            )}
            <p className="mt-1 text-sm text-indigo-100">
              {todayView?.tasks.length ? `${todayView.completionPercent}% complete` : 'No schedule yet for today'}
            </p>
          </div>

          {todayView?.tasks.length ? (
            <div className="w-full max-w-xs">
              <Progress value={todayView.completionPercent} className="h-2.5 bg-white/20" indicatorClassName="bg-white" />
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                className="bg-white text-indigo-700 hover:bg-white/90"
                onClick={() => handleGeneratePlan(8)}
                disabled={generatePlan.isPending}
              >
                <Sparkles className="h-4 w-4" /> Generate Today's Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {summaryLoading || !summary ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatCard label="Today's Focus" value={summary.todayFocusHours} suffix="h" icon={Flame} accent="indigo" />
            <StatCard label="Today Completed" value={summary.todayCompletedHours} suffix="h" icon={CheckCircle2} accent="emerald" />
            <StatCard label="Today Completion" value={summary.todayCompletionPercent} suffix="%" icon={TrendingUp} accent="blue" />
            <StatCard label="Weekly Focus" value={summary.weeklyFocusHours} suffix="h" icon={CalendarRange} accent="violet" />
            <StatCard label="Monthly Focus" value={summary.monthlyFocusHours} suffix="h" icon={CalendarDays} accent="indigo" />
            <StatCard label="DSA Solved (mo)" value={summary.dsaProblemsSolved} icon={BrainCircuit} accent="blue" />
            <StatCard label="Applications (mo)" value={summary.jobApplications} icon={Briefcase} accent="violet" />
            <StatCard label="Interviews" value={summary.interviews} icon={MessageSquare} accent="amber" />
          </>
        )}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {todayView?.tasks.length
                ? `Planned ${formatMinutes(todayView.plannedMinutes)} · Completed ${formatMinutes(todayView.completedMinutes)}`
                : 'Nothing planned yet'}
            </CardDescription>
          </div>
          {!!todayView?.tasks.length && (
            <Button variant="outline" size="sm" onClick={() => handleGeneratePlan(10)} disabled={generatePlan.isPending}>
              <Sparkles className="h-3.5 w-3.5" /> Extend to 10h
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {todayLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <TaskTimeline
              tasks={todayView?.tasks ?? []}
              currentTaskId={todayView?.current?.id}
              onEdit={openEditTask}
              emptyContent={
                <EmptyState
                  icon={Sparkles}
                  title="No tasks scheduled for today"
                  description="Generate your default 8-hour focus schedule, or add tasks manually."
                  actionLabel="Generate Today's Plan"
                  onAction={() => handleGeneratePlan(8)}
                />
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Weekly chart + category breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Productivity</CardTitle>
            <CardDescription>Planned vs. actual focus hours, Monday to Sunday</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyLoading || !weekly ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <WeeklyBarChart days={weekly.days} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Where your time went this week</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyLoading || !weekly ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <CategoryDonut data={weekly.categoryBreakdown} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Career progress */}
      <Card>
        <CardHeader>
          <CardTitle>Career Progress</CardTitle>
          <CardDescription>Are you progressing toward a better job?</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CareerMiniCard
            icon={BrainCircuit}
            label="DSA Problems"
            value={summary?.dsaProblemsSolved ?? 0}
            suffix="solved this month"
            accent="indigo"
            href="/dsa"
          />
          <CareerMiniCard
            icon={Briefcase}
            label="Job Applications"
            value={summary?.jobApplications ?? 0}
            suffix="sent this month"
            accent="violet"
            href="/jobs"
          />
          <CareerMiniCard
            icon={GraduationCap}
            label="Learning Progress"
            value={summary?.learningProgress ?? 0}
            suffixIsPercent
            suffix="average completion"
            accent="blue"
            href="/learning"
          />
        </CardContent>
      </Card>

      <TaskFormDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} defaultDate={today} task={editingTask} />
    </div>
  );
}

function CareerMiniCard({
  icon: Icon,
  label,
  value,
  suffix,
  suffixIsPercent,
  accent,
  href,
}: {
  icon: typeof BrainCircuit;
  label: string;
  value: number;
  suffix: string;
  suffixIsPercent?: boolean;
  accent: 'indigo' | 'violet' | 'blue';
  href: string;
}) {
  const accents = {
    indigo: 'bg-indigo-500/10 text-indigo-500',
    violet: 'bg-violet-500/10 text-violet-500',
    blue: 'bg-blue-500/10 text-blue-500',
  };
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border p-4 transition-colors hover:border-primary/30 hover:bg-muted/40"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">
          {value}
          {suffixIsPercent ? '%' : ''}
        </p>
        <p className="truncate text-xs text-muted-foreground">{suffix}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
