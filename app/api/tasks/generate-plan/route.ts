import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { generatePlan } from '@/lib/services/tasks';
import { toErrorResponse } from '@/lib/errors';

const schema = z.object({
  date: z.string().min(1),
  targetHours: z.number().optional(),
  force: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = schema.parse(await req.json());
    return NextResponse.json(await generatePlan(user.id, body.date, body.targetHours ?? 8, body.force ?? false));
  } catch (err) {
    return toErrorResponse(err);
  }
}
