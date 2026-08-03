import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { removeJob, updateJob } from '@/lib/services/jobs';
import { toErrorResponse } from '@/lib/errors';

const JOB_STATUSES = ['APPLIED', 'SCREENING', 'HR', 'TECHNICAL_ROUND', 'FINAL_ROUND', 'OFFER', 'REJECTED', 'GHOSTED'] as const;

const updateSchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  dateApplied: z.string().min(1).optional(),
  location: z.string().optional(),
  jobUrl: z.string().optional(),
  experience: z.string().optional(),
  expectedCtc: z.string().optional(),
  status: z.enum(JOB_STATUSES).optional(),
  followUpDate: z.string().optional(),
  interviewDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const body = updateSchema.parse(await req.json());
    return NextResponse.json(await updateJob(user.id, id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    return NextResponse.json(await removeJob(user.id, id));
  } catch (err) {
    return toErrorResponse(err);
  }
}
