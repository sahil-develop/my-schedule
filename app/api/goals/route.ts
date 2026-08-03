import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getGoalForMonth, upsertGoal } from '@/lib/services/goals';
import { toErrorResponse } from '@/lib/errors';

const upsertSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  dsaTarget: z.number().int().min(0).optional(),
  jobApplicationsTarget: z.number().int().min(0).optional(),
  learningHoursTarget: z.number().min(0).optional(),
  revisionHoursTarget: z.number().min(0).optional(),
  interviewPrepHoursTarget: z.number().min(0).optional(),
  projectHoursTarget: z.number().min(0).optional(),
});

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const now = new Date();
  const month = Number(req.nextUrl.searchParams.get('month') ?? now.getMonth() + 1);
  const year = Number(req.nextUrl.searchParams.get('year') ?? now.getFullYear());
  return NextResponse.json(await getGoalForMonth(user.id, month, year));
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = upsertSchema.parse(await req.json());
    return NextResponse.json(await upsertGoal(user.id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}
