import { prisma } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors';
import { parseDateOnly, startOfDay, startOfMonth, startOfWeek } from '../date-utils';

export interface CreateJobInput {
  company: string;
  role: string;
  dateApplied: string;
  location?: string;
  jobUrl?: string;
  experience?: string;
  expectedCtc?: string;
  status?: string;
  followUpDate?: string;
  interviewDate?: string;
  notes?: string;
}
export type UpdateJobInput = Partial<CreateJobInput>;

async function assertJobOwned(userId: string, id: string) {
  const job = await prisma.jobApplication.findUnique({ where: { id } });
  if (!job) throw new NotFoundError('Job application not found');
  if (job.userId !== userId) throw new ForbiddenError();
  return job;
}

export function findAllJobs(userId: string) {
  return prisma.jobApplication.findMany({ where: { userId }, orderBy: { dateApplied: 'desc' } });
}

export function createJob(userId: string, dto: CreateJobInput) {
  return prisma.jobApplication.create({
    data: {
      userId,
      company: dto.company,
      role: dto.role,
      dateApplied: parseDateOnly(dto.dateApplied),
      location: dto.location,
      jobUrl: dto.jobUrl,
      experience: dto.experience,
      expectedCtc: dto.expectedCtc,
      status: dto.status ?? 'APPLIED',
      followUpDate: dto.followUpDate ? parseDateOnly(dto.followUpDate) : undefined,
      interviewDate: dto.interviewDate ? parseDateOnly(dto.interviewDate) : undefined,
      notes: dto.notes,
    },
  });
}

export async function updateJob(userId: string, id: string, dto: UpdateJobInput) {
  await assertJobOwned(userId, id);
  return prisma.jobApplication.update({
    where: { id },
    data: {
      ...dto,
      ...(dto.dateApplied ? { dateApplied: parseDateOnly(dto.dateApplied) } : {}),
      ...(dto.followUpDate ? { followUpDate: parseDateOnly(dto.followUpDate) } : {}),
      ...(dto.interviewDate ? { interviewDate: parseDateOnly(dto.interviewDate) } : {}),
    },
  });
}

export async function removeJob(userId: string, id: string) {
  await assertJobOwned(userId, id);
  return prisma.jobApplication.delete({ where: { id } });
}

export async function jobStats(userId: string) {
  const now = new Date();
  const [today, week, month, all] = await Promise.all([
    prisma.jobApplication.count({ where: { userId, dateApplied: { gte: startOfDay(now) } } }),
    prisma.jobApplication.count({ where: { userId, dateApplied: { gte: startOfWeek(now) } } }),
    prisma.jobApplication.count({ where: { userId, dateApplied: { gte: startOfMonth(now) } } }),
    prisma.jobApplication.findMany({ where: { userId } }),
  ]);

  return {
    appliedToday: today,
    appliedThisWeek: week,
    appliedThisMonth: month,
    totalApplications: all.length,
    interviews: all.filter((j) => ['TECHNICAL_ROUND', 'FINAL_ROUND', 'HR'].includes(j.status)).length,
    offers: all.filter((j) => j.status === 'OFFER').length,
    pendingFollowUps: all.filter((j) => j.followUpDate && new Date(j.followUpDate) >= startOfDay(now)).length,
  };
}
