import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUser } from '@/lib/services/auth';
import { setAuthCookie } from '@/lib/auth';
import { toErrorResponse } from '@/lib/errors';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const { token, user } = await registerUser(body);
    await setAuthCookie(token);
    return NextResponse.json({ user });
  } catch (err) {
    return toErrorResponse(err);
  }
}
