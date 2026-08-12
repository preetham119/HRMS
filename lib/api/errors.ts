import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV !== 'production';

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Error responses include the underlying cause outside production so failures are
 * debuggable from the browser instead of only the server console.
 */
export function apiError(
  context: string,
  error: unknown,
  userMessage: string,
  status = 500,
) {
  console.error(`${context}:`, error);

  return NextResponse.json(
    isDev ? { error: userMessage, detail: errorMessage(error) } : { error: userMessage },
    { status },
  );
}
