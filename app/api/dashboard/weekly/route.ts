import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getWeeklyView } from '@/lib/services/dashboard';

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const date = req.nextUrl.searchParams.get('date') ?? undefined;
  return NextResponse.json(await getWeeklyView(user.id, date));
}
