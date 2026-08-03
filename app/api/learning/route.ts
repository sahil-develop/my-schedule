import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createLearning, findAllLearning } from '@/lib/services/learning';
import { toErrorResponse } from '@/lib/errors';

const createSchema = z.object({
  skill: z.string().min(1),
  topic: z.string().optional(),
  plannedHours: z.number().min(0),
  completedHours: z.number().min(0).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED']).optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await findAllLearning(user.id));
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = createSchema.parse(await req.json());
    return NextResponse.json(await createLearning(user.id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}
