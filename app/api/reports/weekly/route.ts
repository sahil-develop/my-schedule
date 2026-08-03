import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { weeklyReport } from '@/lib/services/reports';

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const date = req.nextUrl.searchParams.get('date') ?? undefined;
  return NextResponse.json(await weeklyReport(user.id, date));
}
