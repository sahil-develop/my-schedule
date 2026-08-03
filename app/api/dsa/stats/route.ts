import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { dsaStats } from '@/lib/services/dsa';

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await dsaStats(user.id));
}
