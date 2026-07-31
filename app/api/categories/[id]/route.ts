import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { removeCategory, updateCategory } from '@/lib/services/categories';
import { toErrorResponse } from '@/lib/errors';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  bucket: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const body = updateSchema.parse(await req.json());
    return NextResponse.json(await updateCategory(user.id, id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    return NextResponse.json(await removeCategory(user.id, id));
  } catch (err) {
    return toErrorResponse(err);
  }
}
