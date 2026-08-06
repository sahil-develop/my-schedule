'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWeeklyView, useMonthlyView } from '@/hooks/useDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/StatCard';
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart';
import { CategoryDonut } from '@/components/dashboard/CategoryDonut';
import { DailyTrendChart } from '@/components/dashboard/DailyTrendChart';
import { MonthlyHeatmap } from '@/components/dashboard/MonthlyHeatmap';
import { Clock, TrendingUp, BrainCircuit, Briefcase, Award } from 'lucide-react';
import { todayIso } from '@/lib/utils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AnalyticsPage() {
  const [weekAnchor, setWeekAnchor] = useState(todayIso());
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: weekly, isLoading: weeklyLoading } = useWeeklyView(weekAnchor);
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyView(month, year);

  function shiftWeek(days: number) {
    const d = new Date(weekAnchor + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setWeekAnchor(d.toISOString().slice(0, 10));
  }

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setMonth(m);
    setYear(y);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep dive into your productivity patterns.</p>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Week of {weekly?.weekStart ?? '...'}</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => shiftWeek(-7)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => shiftWeek(7)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Planned vs Actual Hours</CardTitle>
                <CardDescription>Daily breakdown, Monday to Sunday</CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyLoading || !weekly ? <Skeleton className="h-[280px]" /> : <WeeklyBarChart days={weekly.days} />}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Hours by Category</CardTitle>
                <CardDescription>Where your focus went</CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyLoading || !weekly ? <Skeleton className="h-48" /> : <CategoryDonut data={weekly.categoryBreakdown} />}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Productivity Trend</CardTitle>
              <CardDescription>Completion rate across the week</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyLoading || !weekly ? <Skeleton className="h-[220px]" /> : <DailyTrendChart days={weekly.days} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {MONTH_NAMES[month - 1]} {year}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {monthlyLoading || !monthly ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
            ) : (
              <>
                <StatCard label="Total Focus" value={monthly.stats.totalFocusHours} suffix="h" icon={Clock} accent="indigo" />
                <StatCard label="Avg Daily" value={monthly.stats.avgDailyHours} suffix="h" icon={TrendingUp} accent="blue" />
                <StatCard label="Completion Rate" value={monthly.stats.completionRate} suffix="%" icon={Award} accent="emerald" />
                <StatCard label="DSA Hours" value={monthly.stats.dsaHours} suffix="h" icon={BrainCircuit} accent="violet" />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Productivity Heatmap</CardTitle>
                <CardDescription>Darker green means a more complete day</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyLoading || !monthly ? (
                  <Skeleton className="h-72" />
                ) : (
                  <MonthlyHeatmap month={month} year={year} days={monthly.calendar} />
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {monthlyLoading || !monthly ? (
                  <Skeleton className="h-56" />
                ) : (
                  <>
                    <StatRow label="Job Application Hours" value={`${monthly.stats.jobHours}h`} />
                    <StatRow label="Revision Hours" value={`${monthly.stats.revisionHours}h`} />
                    <StatRow label="Learning Hours" value={`${monthly.stats.learningHours}h`} />
                    <StatRow label="Project Hours" value={`${monthly.stats.projectHours}h`} />
                    <StatRow
                      label="Best Productivity Day"
                      value={monthly.stats.bestProductivityDay ?? '—'}
                      icon={<Briefcase className="h-3.5 w-3.5 text-muted-foreground" />}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatRow({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-0">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
