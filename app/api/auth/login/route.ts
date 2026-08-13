import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, createJwtToken } from '@/lib/auth';
import { getMockProfile } from '@/lib/auth/mock-profile-store';
import { findMockUser } from '@/lib/auth/mock-users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = findMockUser(email, password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = createJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const profile = getMockProfile(user.employeeId);

    const response = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          name: profile?.fullName || user.name,
          department: profile?.department || user.department,
          companyId: 'demo-company',
          companyName: 'DesIDEA Technologies',
          profilePicture: profile?.profilePicture ?? null,
        },
      },
      { status: 200 },
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
