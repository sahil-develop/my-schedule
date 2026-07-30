import { prisma } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors';

export interface CreateLearningInput {
  skill: string;
  topic?: string;
  plannedHours: number;
  completedHours?: number;
  startDate?: string;
  targetDate?: string;
  status?: string;
  notes?: string;
}
export type UpdateLearningInput = Partial<CreateLearningInput>;

async function assertLearningOwned(userId: string, id: string) {
  const item = await prisma.learningItem.findUnique({ where: { id } });
  if (!item) throw new NotFoundError('Learning item not found');
  if (item.userId !== userId) throw new ForbiddenError();
  return item;
}

export function findAllLearning(userId: string) {
  return prisma.learningItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export function createLearning(userId: string, dto: CreateLearningInput) {
  return prisma.learningItem.create({
    data: {
      userId,
      skill: dto.skill,
      topic: dto.topic,
      plannedHours: dto.plannedHours,
      completedHours: dto.completedHours ?? 0,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      status: dto.status ?? 'NOT_STARTED',
      notes: dto.notes,
    },
  });
}

export async function updateLearning(userId: string, id: string, dto: UpdateLearningInput) {
  await assertLearningOwned(userId, id);
  return prisma.learningItem.update({
    where: { id },
    data: {
      ...dto,
      ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
      ...(dto.targetDate ? { targetDate: new Date(dto.targetDate) } : {}),
    },
  });
}

export async function removeLearning(userId: string, id: string) {
  await assertLearningOwned(userId, id);
  return prisma.learningItem.delete({ where: { id } });
}
