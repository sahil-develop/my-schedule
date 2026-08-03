import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getDashboardSummary } from '@/lib/services/dashboard';

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await getDashboardSummary(user.id));
}
