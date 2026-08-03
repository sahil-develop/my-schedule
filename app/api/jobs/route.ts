import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createJob, findAllJobs } from '@/lib/services/jobs';
import { toErrorResponse } from '@/lib/errors';

const JOB_STATUSES = ['APPLIED', 'SCREENING', 'HR', 'TECHNICAL_ROUND', 'FINAL_ROUND', 'OFFER', 'REJECTED', 'GHOSTED'] as const;

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  dateApplied: z.string().min(1),
  location: z.string().optional(),
  jobUrl: z.string().optional(),
  experience: z.string().optional(),
  expectedCtc: z.string().optional(),
  status: z.enum(JOB_STATUSES).optional(),
  followUpDate: z.string().optional(),
  interviewDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await findAllJobs(user.id));
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = createSchema.parse(await req.json());
    return NextResponse.json(await createJob(user.id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}
