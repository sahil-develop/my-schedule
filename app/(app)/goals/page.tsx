'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Target } from 'lucide-react';
import { useMonthlyGoal } from '@/hooks/useGoals';
import { GoalsFormDialog } from '@/components/goals/GoalsFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function GoalsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useMonthlyGoal(month, year);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setMonth(m);
    setYear(y);
  }

  const rows = data
    ? [
        { label: 'DSA Problems', target: data.goal.dsaTarget, actual: data.actuals.dsaActual, unit: '' },
        { label: 'Job Applications', target: data.goal.jobApplicationsTarget, actual: data.actuals.jobApplicationsActual, unit: '' },
        { label: 'Learning', target: data.goal.learningHoursTarget, actual: data.actuals.learningHoursActual, unit: 'h' },
        { label: 'Revision', target: data.goal.revisionHoursTarget, actual: data.actuals.revisionHoursActual, unit: 'h' },
        { label: 'Interview Preparation', target: data.goal.interviewPrepHoursTarget, actual: data.actuals.interviewPrepHoursActual, unit: 'h' },
        { label: 'Project Work', target: data.goal.projectHoursTarget, actual: data.actuals.projectHoursActual, unit: 'h' },
      ]
    : [];

  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth;
  const expectedPace = dayOfMonth / daysInMonth;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monthly Goals</h1>
          <p className="text-sm text-muted-foreground">Career targets, tracked against reality.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {data && (
            <Button className="ml-2" onClick={() => setDialogOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit Goals
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading || !data ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Goal</th>
                    <th className="px-5 py-3 font-medium">Target</th>
                    <th className="px-5 py-3 font-medium">Actual</th>
                    <th className="px-5 py-3 font-medium w-48">Progress</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const percent = row.target ? Math.min(100, Math.round((row.actual / row.target) * 100)) : 0;
                    const achieved = row.actual >= row.target;
                    const onTrack = !achieved && percent / 100 >= expectedPace - 0.1;
                    const status = achieved ? 'Achieved' : onTrack ? 'On Track' : 'Behind';
                    const variant = achieved ? 'success' : onTrack ? 'accent' : 'warning';
                    return (
                      <tr key={row.label} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-4 font-medium">{row.label}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {row.target}
                          {row.unit}
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {row.actual}
                          {row.unit}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Progress value={percent} className="h-1.5" />
                            <span className="w-9 shrink-0 text-xs text-muted-foreground">{percent}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={variant as any}>{status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoading && !data && (
        <Card className="p-10 text-center">
          <Target className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No goals set for this month yet.</p>
        </Card>
      )}

      {data && (
        <GoalsFormDialog open={dialogOpen} onOpenChange={setDialogOpen} goal={data.goal} month={month} year={year} />
      )}
    </div>
  );
}
