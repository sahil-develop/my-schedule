import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { countUnreadNotifications, findAllNotifications } from '@/lib/services/notifications';

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  const [items, unreadCount] = await Promise.all([findAllNotifications(user.id), countUnreadNotifications(user.id)]);
  return NextResponse.json({ items, unreadCount });
}
