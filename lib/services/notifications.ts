import { prisma } from '../prisma';
import { addDays, startOfDay, timeToMinutes } from '../date-utils';

export function findAllNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
}

export function countUnreadNotifications(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markNotificationRead(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) return null;
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

// Runs every 5 minutes from instrumentation.ts: surfaces tasks starting soon
// and job-application follow-ups due today. In-app only — no push service.
export async function generateNotifications() {
  await generateTaskReminders();
  await generateFollowUpReminders();
}

async function generateTaskReminders() {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const candidates = await prisma.dailyTask.findMany({
    where: { date: { gte: today, lt: tomorrow }, status: 'PENDING' },
  });

  for (const task of candidates) {
    const startMinutes = timeToMinutes(task.startTime);
    const minutesUntil = startMinutes - nowMinutes;
    if (minutesUntil < 0 || minutesUntil > 15) continue;

    const recentDuplicate = await prisma.notification.findFirst({
      where: {
        userId: task.userId,
        type: 'TASK_REMINDER',
        relatedTaskId: task.id,
        createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) },
      },
    });
    if (recentDuplicate) continue;

    await prisma.notification.create({
      data: {
        userId: task.userId,
        type: 'TASK_REMINDER',
        title: 'Starting soon',
        message: `"${task.title}" starts at ${task.startTime}`,
        relatedTaskId: task.id,
      },
    });
  }
}

async function generateFollowUpReminders() {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const dueToday = await prisma.jobApplication.findMany({
    where: { followUpDate: { gte: today, lt: tomorrow } },
  });

  for (const job of dueToday) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: job.userId,
        type: 'FOLLOWUP_DUE',
        relatedTaskId: job.id,
        createdAt: { gte: today },
      },
    });
    if (existing) continue;

    await prisma.notification.create({
      data: {
        userId: job.userId,
        type: 'FOLLOWUP_DUE',
        title: 'Follow-up due today',
        message: `Follow up with ${job.company} for the ${job.role} role`,
        relatedTaskId: job.id,
      },
    });
  }
}
