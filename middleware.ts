import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, decodeJwtToken } from '@/lib/auth';
import { isMockAuthEnabled } from '@/lib/auth/mock-mode';
import { updateSession } from '@/lib/supabase/middleware';

const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/enroll',
  '/join',
  '/forgot-password',
  '/auth',
  '/no-access',
  '/api/onboarding',
  '/api/auth',
];

const ALWAYS_PUBLIC_EXACT = ['/'];

function isPublicPath(pathname: string) {
  if (ALWAYS_PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getMockUser(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
  const payload = decodeJwtToken(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    return null;
  }
  return payload;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublic = isPublicPath(pathname);

  if (isMockAuthEnabled()) {
    const mockUser = getMockUser(request);

    if (!mockUser && !isPublic && !pathname.startsWith('/api/')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const { user, supabaseResponse } = await updateSession(request);

  if (!user && !isPublic && !pathname.startsWith('/api/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
