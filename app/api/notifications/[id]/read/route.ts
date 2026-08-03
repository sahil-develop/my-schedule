import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { markNotificationRead } from '@/lib/services/notifications';

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;
  return NextResponse.json(await markNotificationRead(user.id, id));
}
