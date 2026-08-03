import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { removeDsa, updateDsa } from '@/lib/services/dsa';
import { toErrorResponse } from '@/lib/errors';

const updateSchema = z.object({
  topic: z.string().min(1).optional(),
  problem: z.string().min(1).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  platform: z.string().optional(),
  date: z.string().min(1).optional(),
  timeSpentMinutes: z.number().min(0).optional(),
  status: z.enum(['NOT_STARTED', 'SOLVED', 'NEEDS_REVISION', 'RE_SOLVED']).optional(),
  revisionRequired: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const body = updateSchema.parse(await req.json());
    return NextResponse.json(await updateDsa(user.id, id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    return NextResponse.json(await removeDsa(user.id, id));
  } catch (err) {
    return toErrorResponse(err);
  }
}
