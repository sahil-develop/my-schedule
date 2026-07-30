import { prisma } from '../prisma';
import { dsaStats } from './dsa';
import { jobStats } from './jobs';
import { findAllLearning } from './learning';
import {
  addDays,
  daysInMonth,
  parseDateOnly,
  startOfDay,
  startOfMonth,
  startOfNextMonth,
  startOfWeek,
  timeToMinutes,
  toDateKey,
} from '../date-utils';
import { CategoryBucket, FOCUS_BUCKETS } from '../enums';

type TaskWithCategory = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  plannedMinutes: number;
  actualMinutes: number;
  status: string;
  priority: string;
  date: Date;
  category: { name: string; color: string; icon: string; bucket: string } | null;
};

async function tasksInRange(userId: string, start: Date, end: Date): Promise<TaskWithCategory[]> {
  return prisma.dailyTask.findMany({
    where: { userId, date: { gte: start, lt: end } },
    include: { category: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  }) as unknown as Promise<TaskWithCategory[]>;
}

function focusTasks(tasks: TaskWithCategory[]) {
  return tasks.filter((t) => FOCUS_BUCKETS.includes(t.category?.bucket ?? CategoryBucket.OTHER));
}

function bucketMinutes(tasks: TaskWithCategory[], field: 'plannedMinutes' | 'actualMinutes' = 'actualMinutes') {
  const map = new Map<string, number>();
  for (const t of tasks) {
    const bucket = t.category?.bucket ?? CategoryBucket.OTHER;
    map.set(bucket, (map.get(bucket) ?? 0) + t[field]);
  }
  return map;
}

export async function getTodayView(userId: string, dateStr?: string) {
  const day = startOfDay(dateStr ? parseDateOnly(dateStr) : new Date());
  const nextDay = addDays(day, 1);
  const tasks = await tasksInRange(userId, day, nextDay);

  const now = new Date();
  const isToday = toDateKey(day) === toDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let current: (TaskWithCategory & { progressPercent: number }) | null = null;
  let upNext: TaskWithCategory | null = null;

  if (isToday) {
    for (const t of tasks) {
      const s = timeToMinutes(t.startTime);
      const e = timeToMinutes(t.endTime);
      if (nowMinutes >= s && nowMinutes < e && t.status !== 'SKIPPED') {
        current = { ...t, progressPercent: t.plannedMinutes ? Math.min(100, Math.round((t.actualMinutes / t.plannedMinutes) * 100)) : 0 };
      }
      if (!upNext && s > nowMinutes) {
        upNext = t;
      }
    }
  }

  const focus = focusTasks(tasks);
  const plannedMinutes = focus.reduce((s, t) => s + t.plannedMinutes, 0);
  const completedMinutes = focus.reduce((s, t) => s + t.actualMinutes, 0);

  return {
    date: toDateKey(day),
    tasks,
    current,
    upNext,
    plannedMinutes,
    completedMinutes,
    completionPercent: plannedMinutes ? Math.round((completedMinutes / plannedMinutes) * 100) : 0,
  };
}

export async function getDashboardSummary(userId: string) {
  const now = new Date();
  const today = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const nextMonthStart = startOfNextMonth(now);

  const [todayTasks, weekTasks, monthTasks, dsa, jobs, learningItems] = await Promise.all([
    tasksInRange(userId, today, addDays(today, 1)),
    tasksInRange(userId, weekStart, addDays(weekStart, 7)),
    tasksInRange(userId, monthStart, nextMonthStart),
    dsaStats(userId),
    jobStats(userId),
    findAllLearning(userId),
  ]);

  const todayPlanned = focusTasks(todayTasks).reduce((s, t) => s + t.plannedMinutes, 0);
  const todayCompleted = focusTasks(todayTasks).reduce((s, t) => s + t.actualMinutes, 0);
  const weekCompleted = focusTasks(weekTasks).reduce((s, t) => s + t.actualMinutes, 0);
  const monthCompleted = focusTasks(monthTasks).reduce((s, t) => s + t.actualMinutes, 0);

  const learningProgress = learningItems.length
    ? Math.round(
        (learningItems.reduce((s, i) => s + (i.plannedHours ? Math.min(1, i.completedHours / i.plannedHours) : 0), 0) /
          learningItems.length) *
          100,
      )
    : 0;

  return {
    todayFocusHours: Math.round((todayPlanned / 60) * 10) / 10,
    todayCompletedHours: Math.round((todayCompleted / 60) * 10) / 10,
    todayCompletionPercent: todayPlanned ? Math.round((todayCompleted / todayPlanned) * 100) : 0,
    weeklyFocusHours: Math.round((weekCompleted / 60) * 10) / 10,
    monthlyFocusHours: Math.round((monthCompleted / 60) * 10) / 10,
    dsaProblemsSolved: dsa.solvedThisMonth,
    jobApplications: jobs.appliedThisMonth,
    interviews: jobs.interviews,
    learningProgress,
  };
}

export async function getWeeklyView(userId: string, dateStr?: string) {
  const weekStart = startOfWeek(dateStr ? parseDateOnly(dateStr) : new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const tasks = await tasksInRange(userId, weekStart, addDays(weekStart, 7));
  const byDay = days.map((day) => {
    const key = toDateKey(day);
    const dayTasks = tasks.filter((t) => toDateKey(t.date) === key);
    const focusDayTasks = focusTasks(dayTasks);
    const planned = focusDayTasks.reduce((s, t) => s + t.plannedMinutes, 0);
    const completed = focusDayTasks.reduce((s, t) => s + t.actualMinutes, 0);
    const buckets = bucketMinutes(dayTasks);
    return {
      date: key,
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      plannedHours: Math.round((planned / 60) * 10) / 10,
      completedHours: Math.round((completed / 60) * 10) / 10,
      completionPercent: planned ? Math.round((completed / planned) * 100) : 0,
      dsaHours: Math.round(((buckets.get(CategoryBucket.DSA) ?? 0) / 60) * 10) / 10,
      jobHours: Math.round(((buckets.get(CategoryBucket.JOB) ?? 0) / 60) * 10) / 10,
      learningHours: Math.round(((buckets.get(CategoryBucket.LEARNING) ?? 0) / 60) * 10) / 10,
    };
  });

  const allBuckets = bucketMinutes(tasks);
  const categoryBreakdown = Array.from(allBuckets.entries()).map(([bucket, minutes]) => ({
    bucket,
    hours: Math.round((minutes / 60) * 10) / 10,
  }));

  return { weekStart: toDateKey(weekStart), days: byDay, categoryBreakdown };
}

export async function getMonthlyView(userId: string, month: number, year: number) {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const totalDays = daysInMonth(month, year);

  const tasks = await tasksInRange(userId, monthStart, monthEnd);

  const calendar = Array.from({ length: totalDays }, (_, i) => {
    const day = addDays(monthStart, i);
    const key = toDateKey(day);
    const dayTasks = tasks.filter((t) => toDateKey(t.date) === key);
    const focusDayTasks = focusTasks(dayTasks);
    const planned = focusDayTasks.reduce((s, t) => s + t.plannedMinutes, 0);
    const completed = focusDayTasks.reduce((s, t) => s + t.actualMinutes, 0);
    return {
      date: key,
      focusHours: Math.round((completed / 60) * 10) / 10,
      completionPercent: planned ? Math.round((completed / planned) * 100) : 0,
      taskCount: dayTasks.length,
    };
  });

  const buckets = bucketMinutes(tasks);
  const focusTasksInMonth = focusTasks(tasks);
  const totalCompleted = focusTasksInMonth.reduce((s, t) => s + t.actualMinutes, 0);
  const totalPlanned = focusTasksInMonth.reduce((s, t) => s + t.plannedMinutes, 0);
  const daysWithActivity = calendar.filter((d) => d.taskCount > 0).length;
  const bestDay = calendar.reduce((best, d) => (d.focusHours > (best?.focusHours ?? -1) ? d : best), null as (typeof calendar)[number] | null);

  return {
    month,
    year,
    calendar,
    stats: {
      totalFocusHours: Math.round((totalCompleted / 60) * 10) / 10,
      avgDailyHours: daysWithActivity ? Math.round((totalCompleted / 60 / daysWithActivity) * 10) / 10 : 0,
      dsaHours: Math.round(((buckets.get(CategoryBucket.DSA) ?? 0) / 60) * 10) / 10,
      jobHours: Math.round(((buckets.get(CategoryBucket.JOB) ?? 0) / 60) * 10) / 10,
      revisionHours: Math.round(((buckets.get(CategoryBucket.REVISION) ?? 0) / 60) * 10) / 10,
      learningHours: Math.round(((buckets.get(CategoryBucket.LEARNING) ?? 0) / 60) * 10) / 10,
      projectHours: Math.round(((buckets.get(CategoryBucket.PROJECT) ?? 0) / 60) * 10) / 10,
      completionRate: totalPlanned ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
      bestProductivityDay: bestDay?.focusHours ? bestDay.date : null,
    },
  };
}
