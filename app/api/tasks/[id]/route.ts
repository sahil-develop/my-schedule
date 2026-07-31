import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { removeTask, updateTask } from '@/lib/services/tasks';
import { toErrorResponse } from '@/lib/errors';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  startTime: z.string().regex(TIME_REGEX).optional(),
  endTime: z.string().regex(TIME_REGEX).optional(),
  categoryId: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const body = updateSchema.parse(await req.json());
    return NextResponse.json(await updateTask(user.id, id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    return NextResponse.json(await removeTask(user.id, id));
  } catch (err) {
    return toErrorResponse(err);
  }
}
