import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { removeLearning, updateLearning } from '@/lib/services/learning';
import { toErrorResponse } from '@/lib/errors';

const updateSchema = z.object({
  skill: z.string().min(1).optional(),
  topic: z.string().optional(),
  plannedHours: z.number().min(0).optional(),
  completedHours: z.number().min(0).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED']).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const body = updateSchema.parse(await req.json());
    return NextResponse.json(await updateLearning(user.id, id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    return NextResponse.json(await removeLearning(user.id, id));
  } catch (err) {
    return toErrorResponse(err);
  }
}
