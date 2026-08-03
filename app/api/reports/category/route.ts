import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { categoryReport } from '@/lib/services/reports';
import { BadRequestError, toErrorResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const start = req.nextUrl.searchParams.get('start');
    const end = req.nextUrl.searchParams.get('end');
    if (!start || !end) throw new BadRequestError('start and end are required');
    return NextResponse.json(await categoryReport(user.id, start, end));
  } catch (err) {
    return toErrorResponse(err);
  }
}
