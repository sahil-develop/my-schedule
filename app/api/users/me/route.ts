import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { updateProfile } from '@/lib/services/users';
import { toErrorResponse } from '@/lib/errors';

const schema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = schema.parse(await req.json());
    const updated = await updateProfile(user.id, body);
    return NextResponse.json(updated);
  } catch (err) {
    return toErrorResponse(err);
  }
}
