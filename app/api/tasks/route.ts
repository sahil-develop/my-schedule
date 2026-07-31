import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createTask, findTasksByDate, findTasksByRange } from '@/lib/services/tasks';
import { toErrorResponse } from '@/lib/errors';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().regex(TIME_REGEX, 'startTime must be in HH:mm format'),
  endTime: z.string().regex(TIME_REGEX, 'endTime must be in HH:mm format'),
  categoryId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']).optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const searchParams = req.nextUrl.searchParams;
  const date = searchParams.get('date');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (start && end) return NextResponse.json(await findTasksByRange(user.id, start, end));
  return NextResponse.json(await findTasksByDate(user.id, date ?? new Date().toISOString()));
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = createSchema.parse(await req.json());
    return NextResponse.json(await createTask(user.id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}
