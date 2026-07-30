import * as bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

export async function updateProfile(userId: string, data: { name?: string; password?: string }) {
  const update: { name?: string; password?: string } = {};
  if (data.name) update.name = data.name;
  if (data.password) update.password = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.update({ where: { id: userId }, data: update });
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
