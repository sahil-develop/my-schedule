import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { stopTaskTimer } from '@/lib/services/tasks';
import { toErrorResponse } from '@/lib/errors';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    return NextResponse.json(await stopTaskTimer(user.id, id));
  } catch (err) {
    return toErrorResponse(err);
  }
}
