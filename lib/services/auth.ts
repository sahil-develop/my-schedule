import * as bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { ConflictError, UnauthorizedError } from '../errors';
import { signToken } from '../auth';
import { seedDefaultCategories } from './categories';

export async function registerUser(dto: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const password = await bcrypt.hash(dto.password, 12);
  const user = await prisma.user.create({
    data: { email: dto.email, password, name: dto.name },
  });

  await seedDefaultCategories(user.id);

  return buildAuthResult(user);
}

export async function loginUser(dto: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  return buildAuthResult(user);
}

function buildAuthResult(user: { id: string; email: string; name: string; password: string }) {
  const token = signToken({ sub: user.id, email: user.email });
  const { password: _password, ...safeUser } = user;
  return { token, user: safeUser };
}
