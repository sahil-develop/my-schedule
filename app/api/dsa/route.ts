import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createDsa, findAllDsa } from '@/lib/services/dsa';
import { toErrorResponse } from '@/lib/errors';

const createSchema = z.object({
  topic: z.string().min(1),
  problem: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  platform: z.string().optional(),
  date: z.string().min(1),
  timeSpentMinutes: z.number().min(0).optional(),
  status: z.enum(['NOT_STARTED', 'SOLVED', 'NEEDS_REVISION', 'RE_SOLVED']).optional(),
  revisionRequired: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await findAllDsa(user.id));
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = createSchema.parse(await req.json());
    return NextResponse.json(await createDsa(user.id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}
