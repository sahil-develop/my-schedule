import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { learningReport } from '@/lib/services/reports';

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await learningReport(user.id));
}
