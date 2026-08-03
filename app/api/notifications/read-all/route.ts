import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { markAllNotificationsRead } from '@/lib/services/notifications';

export async function PATCH() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await markAllNotificationsRead(user.id));
}
