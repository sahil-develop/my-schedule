import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(404, message);
  }
}
export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}
export class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}
export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}
export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

/** Wrap a route handler body in try/catch and call this in the catch block. */
export function toErrorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json({ message: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json({ message: err.issues.map((i) => i.message) }, { status: 400 });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
}
