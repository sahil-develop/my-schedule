import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET as string;

const PROTECTED_PATHS = ['/', '/schedule', '/analytics', '/dsa', '/jobs', '/learning', '/goals', '/reports', '/settings'];
const AUTH_PATHS = ['/login', '/register'];

function hasValidSession(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = hasValidSession(request);

  if (AUTH_PATHS.includes(pathname)) {
    if (authed) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (PROTECTED_PATHS.includes(pathname) && !authed) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// `matcher` must be statically analyzable at build time (no spreads/variables),
// so this list is kept in sync with PROTECTED_PATHS + AUTH_PATHS above by hand.
export const config = {
  matcher: ['/', '/schedule', '/analytics', '/dsa', '/jobs', '/learning', '/goals', '/reports', '/settings', '/login', '/register'],
};
