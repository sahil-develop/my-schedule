import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { jobStats } from '@/lib/services/jobs';

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await jobStats(user.id));
}
