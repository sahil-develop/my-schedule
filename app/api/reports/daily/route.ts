import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { dailyReport } from '@/lib/services/reports';

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const date = req.nextUrl.searchParams.get('date') ?? undefined;
  return NextResponse.json(await dailyReport(user.id, date));
}
