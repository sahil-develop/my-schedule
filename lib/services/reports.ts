import { prisma } from '../prisma';
import { dsaStats } from './dsa';
import { jobStats } from './jobs';
import { findAllLearning } from './learning';
import { getGoalForMonth } from './goals';
import { getTodayView, getWeeklyView, getMonthlyView } from './dashboard';
import { CategoryBucket } from '../enums';
import { addDays, parseDateOnly, startOfDay } from '../date-utils';

export const dailyReport = getTodayView;
export const weeklyReport = getWeeklyView;
export const monthlyReport = getMonthlyView;

export async function categoryReport(userId: string, startStr: string, endStr: string) {
  const start = startOfDay(parseDateOnly(startStr));
  const end = addDays(startOfDay(parseDateOnly(endStr)), 1);

  const tasks = await prisma.dailyTask.findMany({
    where: { userId, date: { gte: start, lt: end } },
    include: { category: true },
  });

  const totals = new Map<string, { minutes: number; taskCount: number; color: string }>();
  for (const t of tasks) {
    const bucket = t.category?.bucket ?? CategoryBucket.OTHER;
    const color = t.category?.color ?? '#94a3b8';
    const entry = totals.get(bucket) ?? { minutes: 0, taskCount: 0, color };
    entry.minutes += t.actualMinutes;
    entry.taskCount += 1;
    totals.set(bucket, entry);
  }

  const totalMinutes = Array.from(totals.values()).reduce((s, v) => s + v.minutes, 0);
  const breakdown = Array.from(totals.entries()).map(([bucket, v]) => ({
    bucket,
    color: v.color,
    hours: Math.round((v.minutes / 60) * 10) / 10,
    taskCount: v.taskCount,
    percentOfTotal: totalMinutes ? Math.round((v.minutes / totalMinutes) * 100) : 0,
  }));

  return { start: startStr, end: endStr, totalHours: Math.round((totalMinutes / 60) * 10) / 10, breakdown };
}

export async function careerReport(userId: string, month: number, year: number) {
  const [dsa, jobs, goal] = await Promise.all([dsaStats(userId), jobStats(userId), getGoalForMonth(userId, month, year)]);
  return { dsa, jobs, goal: goal.goal, actuals: goal.actuals };
}

export async function learningReport(userId: string) {
  const items = await findAllLearning(userId);
  const totalPlanned = items.reduce((s, i) => s + i.plannedHours, 0);
  const totalCompleted = items.reduce((s, i) => s + i.completedHours, 0);

  return {
    items,
    totalPlannedHours: totalPlanned,
    totalCompletedHours: totalCompleted,
    overallProgress: totalPlanned ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
  };
}
