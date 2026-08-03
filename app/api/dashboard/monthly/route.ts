import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getMonthlyView } from '@/lib/services/dashboard';

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const now = new Date();
  const month = Number(req.nextUrl.searchParams.get('month') ?? now.getMonth() + 1);
  const year = Number(req.nextUrl.searchParams.get('year') ?? now.getFullYear());
  return NextResponse.json(await getMonthlyView(user.id, month, year));
}
