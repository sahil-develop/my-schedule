'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTodayView, useWeeklyView, useMonthlyView } from '@/hooks/useDashboard';
import { useCategoryReport, useCareerReport, useLearningReport } from '@/hooks/useReports';
import { TaskTimeline } from '@/components/schedule/TaskTimeline';
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart';
import { MonthlyHeatmap } from '@/components/dashboard/MonthlyHeatmap';
import { BUCKET_COLORS, BUCKET_LABELS } from '@/lib/badges';
import { formatMinutes, todayIso } from '@/lib/utils';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Insights across every dimension of your work.</p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="daily"><DailyReport /></TabsContent>
        <TabsContent value="weekly"><WeeklyReport /></TabsContent>
        <TabsContent value="monthly"><MonthlyReport /></TabsContent>
        <TabsContent value="category"><CategoryReport /></TabsContent>
        <TabsContent value="career"><CareerReport /></TabsContent>
        <TabsContent value="learning"><LearningReport /></TabsContent>
      </Tabs>
    </div>
  );
}

function DailyReport() {
  const { data, isLoading } = useTodayView(todayIso());
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Report</CardTitle>
        <CardDescription>
          {data ? `Planned ${formatMinutes(data.plannedMinutes)} · Completed ${formatMinutes(data.completedMinutes)} · ${data.completionPercent}% done` : '...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? <Skeleton className="h-64" /> : (
          <TaskTimeline tasks={data.tasks} currentTaskId={data.current?.id} onEdit={() => {}} emptyContent={<p className="text-sm text-muted-foreground">No tasks today.</p>} />
        )}
      </CardContent>
    </Card>
  );
}

function WeeklyReport() {
  const { data, isLoading } = useWeeklyView(todayIso());
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Report</CardTitle>
        <CardDescription>Week of {data?.weekStart ?? '...'}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? <Skeleton className="h-72" /> : <WeeklyBarChart days={data.days} />}
      </CardContent>
    </Card>
  );
}

function MonthlyReport() {
  const now = new Date();
  const { data, isLoading } = useMonthlyView(now.getMonth() + 1, now.getFullYear());
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Report</CardTitle>
        <CardDescription>
          {data ? `${data.stats.totalFocusHours}h total · ${data.stats.completionRate}% completion rate` : '...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? <Skeleton className="h-72" /> : (
          <MonthlyHeatmap month={now.getMonth() + 1} year={now.getFullYear()} days={data.calendar} />
        )}
      </CardContent>
    </Card>
  );
}

function CategoryReport() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(todayIso());
  const { data, isLoading } = useCategoryReport(start, end);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Report</CardTitle>
        <CardDescription>How your time breaks down by category over a custom range</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="start">From</Label>
            <Input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end">To</Label>
            <Input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          {data && <p className="pb-2 text-sm text-muted-foreground">Total: {data.totalHours}h</p>}
        </div>

        {isLoading || !data ? (
          <Skeleton className="h-48" />
        ) : data.breakdown.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No logged time in this range.</p>
        ) : (
          <div className="space-y-3">
            {data.breakdown
              .sort((a, b) => b.hours - a.hours)
              .map((b) => (
                <div key={b.bucket} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BUCKET_COLORS[b.bucket] ?? b.color }} />
                      {BUCKET_LABELS[b.bucket] ?? b.bucket}
                    </span>
                    <span className="text-muted-foreground">{b.hours}h · {b.percentOfTotal}%</span>
                  </div>
                  <Progress value={b.percentOfTotal} />
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CareerReport() {
  const now = new Date();
  const { data, isLoading } = useCareerReport(now.getMonth() + 1, now.getFullYear());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Report</CardTitle>
        <CardDescription>DSA, applications, and goal progress combined</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-56" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold">DSA</p>
              <p className="text-sm text-muted-foreground">Solved this month: {data.dsa.solvedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Total solved: {data.dsa.totalSolved}</p>
              <div className="flex gap-1.5 pt-1">
                <Badge variant="success">Easy {data.dsa.easy}</Badge>
                <Badge variant="warning">Medium {data.dsa.medium}</Badge>
                <Badge variant="destructive">Hard {data.dsa.hard}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Job Applications</p>
              <p className="text-sm text-muted-foreground">This month: {data.jobs.appliedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Interviews: {data.jobs.interviews} · Offers: {data.jobs.offers}</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-semibold">Monthly Goal Progress</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <GoalMini label="DSA" actual={data.actuals.dsaActual} target={data.goal.dsaTarget} />
                <GoalMini label="Applications" actual={data.actuals.jobApplicationsActual} target={data.goal.jobApplicationsTarget} />
                <GoalMini label="Learning" actual={data.actuals.learningHoursActual} target={data.goal.learningHoursTarget} unit="h" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoalMini({ label, actual, target, unit = '' }: { label: string; actual: number; target: number; unit?: string }) {
  const percent = target ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{actual}{unit} / {target}{unit}</p>
      <Progress value={percent} className="mt-2 h-1.5" />
    </div>
  );
}

function LearningReport() {
  const { data, isLoading } = useLearningReport();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Report</CardTitle>
        <CardDescription>
          {data ? `${data.totalCompletedHours}h / ${data.totalPlannedHours}h · ${data.overallProgress}% overall` : '...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-48" />
        ) : data.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No learning items yet.</p>
        ) : (
          <div className="space-y-3">
            {data.items.map((item) => {
              const percent = item.plannedHours ? Math.min(100, Math.round((item.completedHours / item.plannedHours) * 100)) : 0;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-muted-foreground">{item.completedHours}h / {item.plannedHours}h</span>
                  </div>
                  <Progress value={percent} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
