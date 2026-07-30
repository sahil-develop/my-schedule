import { prisma } from '../prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import { addDays, parseDateOnly, startOfDay, timeToMinutes } from '../date-utils';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export interface CreateTaskInput {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  categoryId?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  notes?: string;
}
export type UpdateTaskInput = Partial<CreateTaskInput>;

interface TemplateSlot {
  startTime: string;
  endTime: string;
  title: string;
  categoryName: string;
  priority: Priority;
}

const BASE_TEMPLATE: TemplateSlot[] = [
  { startTime: '08:00', endTime: '10:00', title: 'DSA Preparation', categoryName: 'DSA Preparation', priority: 'HIGH' },
  { startTime: '10:00', endTime: '10:30', title: 'Break', categoryName: 'Break', priority: 'LOW' },
  { startTime: '10:30', endTime: '12:30', title: 'Backend / New Skill Learning', categoryName: 'Backend / New Skill Learning', priority: 'HIGH' },
  { startTime: '12:30', endTime: '13:30', title: 'Lunch / Break', categoryName: 'Break', priority: 'LOW' },
  { startTime: '13:30', endTime: '15:30', title: 'Job Applications / Career', categoryName: 'Job Applications / Career', priority: 'HIGH' },
  { startTime: '15:30', endTime: '16:00', title: 'Break', categoryName: 'Break', priority: 'LOW' },
  { startTime: '16:00', endTime: '18:00', title: 'Revision / Project Work', categoryName: 'Revision / Project Work', priority: 'MEDIUM' },
  { startTime: '18:00', endTime: '19:00', title: 'Exercise / Personal Time', categoryName: 'Exercise / Personal Time', priority: 'LOW' },
];

const EXTENSION_9H: TemplateSlot = {
  startTime: '19:00',
  endTime: '20:00',
  title: 'Interview Preparation',
  categoryName: 'Interview Preparation',
  priority: 'MEDIUM',
};

const EXTENSION_10H: TemplateSlot = {
  startTime: '20:00',
  endTime: '21:00',
  title: 'Project Work',
  categoryName: 'Revision / Project Work',
  priority: 'MEDIUM',
};

async function assertTaskOwned(userId: string, id: string) {
  const task = await prisma.dailyTask.findUnique({ where: { id } });
  if (!task) throw new NotFoundError('Task not found');
  if (task.userId !== userId) throw new ForbiddenError();
  return task;
}

async function assertNoOverlap(userId: string, date: Date, startTime: string, endTime: string, excludeId?: string) {
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    throw new BadRequestError('endTime must be after startTime');
  }
  const dayStart = startOfDay(date);
  const dayEnd = addDays(dayStart, 1);

  const tasksOnDay = await prisma.dailyTask.findMany({
    where: { userId, date: { gte: dayStart, lt: dayEnd }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);
  const overlap = tasksOnDay.find((t) => {
    const s = timeToMinutes(t.startTime);
    const e = timeToMinutes(t.endTime);
    return newStart < e && s < newEnd;
  });
  if (overlap) {
    throw new BadRequestError(`This overlaps with "${overlap.title}" (${overlap.startTime}–${overlap.endTime})`);
  }
}

export function findTasksByDate(userId: string, date: string) {
  const dayStart = startOfDay(parseDateOnly(date));
  const dayEnd = addDays(dayStart, 1);
  return prisma.dailyTask.findMany({
    where: { userId, date: { gte: dayStart, lt: dayEnd } },
    include: { category: true },
    orderBy: { startTime: 'asc' },
  });
}

export function findTasksByRange(userId: string, start: string, end: string) {
  const rangeStart = startOfDay(parseDateOnly(start));
  const rangeEnd = addDays(startOfDay(parseDateOnly(end)), 1);
  return prisma.dailyTask.findMany({
    where: { userId, date: { gte: rangeStart, lt: rangeEnd } },
    include: { category: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
}

export async function createTask(userId: string, dto: CreateTaskInput) {
  const date = startOfDay(parseDateOnly(dto.date));
  await assertNoOverlap(userId, date, dto.startTime, dto.endTime);
  return prisma.dailyTask.create({
    data: {
      userId,
      title: dto.title,
      date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      plannedMinutes: timeToMinutes(dto.endTime) - timeToMinutes(dto.startTime),
      categoryId: dto.categoryId,
      priority: dto.priority ?? 'MEDIUM',
      status: dto.status ?? 'PENDING',
      notes: dto.notes,
    },
    include: { category: true },
  });
}

export async function updateTask(userId: string, id: string, dto: UpdateTaskInput) {
  const existing = await assertTaskOwned(userId, id);
  const date = dto.date ? startOfDay(parseDateOnly(dto.date)) : existing.date;
  const startTime = dto.startTime ?? existing.startTime;
  const endTime = dto.endTime ?? existing.endTime;

  if (dto.startTime || dto.endTime || dto.date) {
    await assertNoOverlap(userId, date, startTime, endTime, id);
  }

  return prisma.dailyTask.update({
    where: { id },
    data: {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.date ? { date } : {}),
      ...(dto.startTime ? { startTime } : {}),
      ...(dto.endTime ? { endTime } : {}),
      ...(dto.startTime || dto.endTime ? { plannedMinutes: timeToMinutes(endTime) - timeToMinutes(startTime) } : {}),
      ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
      ...(dto.priority ? { priority: dto.priority } : {}),
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    },
    include: { category: true },
  });
}

export async function removeTask(userId: string, id: string) {
  await assertTaskOwned(userId, id);
  return prisma.dailyTask.delete({ where: { id } });
}

export async function startTaskTimer(userId: string, id: string) {
  const task = await assertTaskOwned(userId, id);
  if (task.isTimerRunning) return task;

  await prisma.timerSession.create({ data: { taskId: id, startedAt: new Date() } });
  return prisma.dailyTask.update({
    where: { id },
    data: {
      isTimerRunning: true,
      timerStartedAt: new Date(),
      status: task.status === 'PENDING' ? 'IN_PROGRESS' : task.status,
    },
    include: { category: true },
  });
}

export async function stopTaskTimer(userId: string, id: string) {
  const task = await assertTaskOwned(userId, id);
  if (!task.isTimerRunning) return task;

  const session = await prisma.timerSession.findFirst({
    where: { taskId: id, endedAt: null },
    orderBy: { startedAt: 'desc' },
  });

  const now = new Date();
  let addedMinutes = 0;
  if (session) {
    addedMinutes = Math.max(0, Math.round((now.getTime() - session.startedAt.getTime()) / 60000));
    await prisma.timerSession.update({
      where: { id: session.id },
      data: { endedAt: now, durationMinutes: addedMinutes },
    });
  }

  return prisma.dailyTask.update({
    where: { id },
    data: {
      isTimerRunning: false,
      timerStartedAt: null,
      actualMinutes: task.actualMinutes + addedMinutes,
    },
    include: { category: true },
  });
}

export async function generatePlan(userId: string, date: string, targetHours = 8, force = false) {
  const clampedHours = Math.min(10, Math.max(6, targetHours));
  const day = startOfDay(parseDateOnly(date));

  const dayStart = day;
  const dayEnd = addDays(dayStart, 1);

  if (force) {
    await prisma.dailyTask.deleteMany({
      where: { userId, date: { gte: dayStart, lt: dayEnd }, actualMinutes: 0, isTimerRunning: false },
    });
  }

  const categories = await prisma.category.findMany({ where: { userId } });
  const categoryByName = new Map(categories.map((c) => [c.name, c.id]));

  const template = [...BASE_TEMPLATE];
  if (clampedHours >= 9) template.push(EXTENSION_9H);
  if (clampedHours >= 10) template.push(EXTENSION_10H);

  const existingTasks = await prisma.dailyTask.findMany({
    where: { userId, date: { gte: dayStart, lt: dayEnd } },
  });

  const created: Array<Awaited<ReturnType<typeof prisma.dailyTask.create>>> = [];
  for (const slot of template) {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    const overlaps = existingTasks.some((t) => {
      const s = timeToMinutes(t.startTime);
      const e = timeToMinutes(t.endTime);
      return slotStart < e && s < slotEnd;
    });
    if (overlaps) continue;

    const task = await prisma.dailyTask.create({
      data: {
        userId,
        title: slot.title,
        date: day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        plannedMinutes: slotEnd - slotStart,
        categoryId: categoryByName.get(slot.categoryName),
        priority: slot.priority,
        status: 'PENDING',
      },
      include: { category: true },
    });
    created.push(task);
  }

  const carriedOver = await prisma.dailyTask.findMany({
    where: {
      userId,
      date: { lt: dayStart },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      priority: { in: ['HIGH', 'URGENT'] },
    },
    orderBy: { date: 'desc' },
    take: 5,
    include: { category: true },
  });

  const focusMinutes = template.reduce((sum, s) => sum + (timeToMinutes(s.endTime) - timeToMinutes(s.startTime)), 0);

  return { created, carriedOver, targetHours: clampedHours, plannedMinutes: focusMinutes };
}
