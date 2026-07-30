import { prisma } from '../prisma';
import { CategoryBucket } from '../enums';

export interface UpsertGoalInput {
  month: number;
  year: number;
  dsaTarget?: number;
  jobApplicationsTarget?: number;
  learningHoursTarget?: number;
  revisionHoursTarget?: number;
  interviewPrepHoursTarget?: number;
  projectHoursTarget?: number;
}

function monthRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export async function getGoalForMonth(userId: string, month: number, year: number) {
  const goal = await prisma.monthlyGoal.upsert({
    where: { userId_month_year: { userId, month, year } },
    update: {},
    create: { userId, month, year },
  });
  const actuals = await computeGoalActuals(userId, month, year);
  return { goal, actuals };
}

export async function upsertGoal(userId: string, dto: UpsertGoalInput) {
  const goal = await prisma.monthlyGoal.upsert({
    where: { userId_month_year: { userId, month: dto.month, year: dto.year } },
    update: {
      ...(dto.dsaTarget !== undefined ? { dsaTarget: dto.dsaTarget } : {}),
      ...(dto.jobApplicationsTarget !== undefined ? { jobApplicationsTarget: dto.jobApplicationsTarget } : {}),
      ...(dto.learningHoursTarget !== undefined ? { learningHoursTarget: dto.learningHoursTarget } : {}),
      ...(dto.revisionHoursTarget !== undefined ? { revisionHoursTarget: dto.revisionHoursTarget } : {}),
      ...(dto.interviewPrepHoursTarget !== undefined ? { interviewPrepHoursTarget: dto.interviewPrepHoursTarget } : {}),
      ...(dto.projectHoursTarget !== undefined ? { projectHoursTarget: dto.projectHoursTarget } : {}),
    },
    create: {
      userId,
      month: dto.month,
      year: dto.year,
      dsaTarget: dto.dsaTarget ?? 50,
      jobApplicationsTarget: dto.jobApplicationsTarget ?? 100,
      learningHoursTarget: dto.learningHoursTarget ?? 60,
      revisionHoursTarget: dto.revisionHoursTarget ?? 20,
      interviewPrepHoursTarget: dto.interviewPrepHoursTarget ?? 20,
      projectHoursTarget: dto.projectHoursTarget ?? 20,
    },
  });
  const actuals = await computeGoalActuals(userId, dto.month, dto.year);
  return { goal, actuals };
}

export async function computeGoalActuals(userId: string, month: number, year: number) {
  const { start, end } = monthRange(month, year);

  const [dsaSolved, jobApplications, tasksInMonth] = await Promise.all([
    prisma.dSAProblem.count({
      where: { userId, date: { gte: start, lt: end }, status: { in: ['SOLVED', 'RE_SOLVED'] } },
    }),
    prisma.jobApplication.count({ where: { userId, dateApplied: { gte: start, lt: end } } }),
    prisma.dailyTask.findMany({
      where: { userId, date: { gte: start, lt: end } },
      include: { category: true },
    }),
  ]);

  const minutesByBucket = new Map<string, number>();
  for (const task of tasksInMonth) {
    const bucket = task.category?.bucket ?? CategoryBucket.OTHER;
    minutesByBucket.set(bucket, (minutesByBucket.get(bucket) ?? 0) + task.actualMinutes);
  }
  const hoursOf = (bucket: string) => Math.round(((minutesByBucket.get(bucket) ?? 0) / 60) * 10) / 10;

  return {
    dsaActual: dsaSolved,
    jobApplicationsActual: jobApplications,
    learningHoursActual: hoursOf(CategoryBucket.LEARNING),
    revisionHoursActual: hoursOf(CategoryBucket.REVISION),
    interviewPrepHoursActual: hoursOf(CategoryBucket.INTERVIEW_PREP),
    projectHoursActual: hoursOf(CategoryBucket.PROJECT),
  };
}
