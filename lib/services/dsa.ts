import { prisma } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors';
import { parseDateOnly, startOfDay, startOfMonth, startOfWeek } from '../date-utils';

export interface CreateDsaInput {
  topic: string;
  problem: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  platform?: string;
  date: string;
  timeSpentMinutes?: number;
  status?: 'NOT_STARTED' | 'SOLVED' | 'NEEDS_REVISION' | 'RE_SOLVED';
  revisionRequired?: boolean;
  notes?: string;
}
export type UpdateDsaInput = Partial<CreateDsaInput>;

async function assertDsaOwned(userId: string, id: string) {
  const problem = await prisma.dSAProblem.findUnique({ where: { id } });
  if (!problem) throw new NotFoundError('DSA problem not found');
  if (problem.userId !== userId) throw new ForbiddenError();
  return problem;
}

export function findAllDsa(userId: string) {
  return prisma.dSAProblem.findMany({ where: { userId }, orderBy: { date: 'desc' } });
}

export function createDsa(userId: string, dto: CreateDsaInput) {
  return prisma.dSAProblem.create({
    data: {
      userId,
      topic: dto.topic,
      problem: dto.problem,
      difficulty: dto.difficulty,
      platform: dto.platform,
      date: startOfDay(parseDateOnly(dto.date)),
      timeSpentMinutes: dto.timeSpentMinutes ?? 0,
      status: dto.status ?? 'NOT_STARTED',
      revisionRequired: dto.revisionRequired ?? false,
      notes: dto.notes,
    },
  });
}

export async function updateDsa(userId: string, id: string, dto: UpdateDsaInput) {
  await assertDsaOwned(userId, id);
  return prisma.dSAProblem.update({
    where: { id },
    data: {
      ...dto,
      ...(dto.date ? { date: startOfDay(parseDateOnly(dto.date)) } : {}),
    },
  });
}

export async function removeDsa(userId: string, id: string) {
  await assertDsaOwned(userId, id);
  return prisma.dSAProblem.delete({ where: { id } });
}

export async function dsaStats(userId: string) {
  const now = new Date();
  const [all, today, week, month] = await Promise.all([
    prisma.dSAProblem.findMany({ where: { userId } }),
    prisma.dSAProblem.count({ where: { userId, date: { gte: startOfDay(now) }, status: { in: ['SOLVED', 'RE_SOLVED'] } } }),
    prisma.dSAProblem.count({ where: { userId, date: { gte: startOfWeek(now) }, status: { in: ['SOLVED', 'RE_SOLVED'] } } }),
    prisma.dSAProblem.count({ where: { userId, date: { gte: startOfMonth(now) }, status: { in: ['SOLVED', 'RE_SOLVED'] } } }),
  ]);

  const solved = all.filter((p) => p.status === 'SOLVED' || p.status === 'RE_SOLVED');
  return {
    totalSolved: solved.length,
    solvedToday: today,
    solvedThisWeek: week,
    solvedThisMonth: month,
    easy: solved.filter((p) => p.difficulty === 'EASY').length,
    medium: solved.filter((p) => p.difficulty === 'MEDIUM').length,
    hard: solved.filter((p) => p.difficulty === 'HARD').length,
    revisionPending: all.filter((p) => p.revisionRequired).length,
  };
}
