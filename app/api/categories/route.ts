import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createCategory, findAllCategories } from '@/lib/services/categories';
import { toErrorResponse } from '@/lib/errors';

const createSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  icon: z.string().optional(),
  bucket: z.string().optional(),
});

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  return NextResponse.json(await findAllCategories(user.id));
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = createSchema.parse(await req.json());
    return NextResponse.json(await createCategory(user.id, body));
  } catch (err) {
    return toErrorResponse(err);
  }
}
