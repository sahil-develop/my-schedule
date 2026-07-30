import { prisma } from '../prisma';
import { DEFAULT_CATEGORIES } from '../enums';
import { ForbiddenError, NotFoundError } from '../errors';

export async function seedDefaultCategories(userId: string) {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({
      userId,
      name: c.name,
      color: c.color,
      icon: c.icon,
      bucket: c.bucket,
      isDefault: true,
    })),
  });
}

export function findAllCategories(userId: string) {
  return prisma.category.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
}

export function createCategory(userId: string, data: { name: string; color?: string; icon?: string; bucket?: string }) {
  return prisma.category.create({
    data: {
      userId,
      name: data.name,
      color: data.color ?? '#6366f1',
      icon: data.icon ?? 'circle',
      bucket: data.bucket ?? 'OTHER',
    },
  });
}

async function assertCategoryOwned(userId: string, id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Category not found');
  if (category.userId !== userId) throw new ForbiddenError();
  return category;
}

export async function updateCategory(
  userId: string,
  id: string,
  data: { name?: string; color?: string; icon?: string; bucket?: string },
) {
  await assertCategoryOwned(userId, id);
  return prisma.category.update({ where: { id }, data });
}

export async function removeCategory(userId: string, id: string) {
  await assertCategoryOwned(userId, id);
  return prisma.category.delete({ where: { id } });
}
