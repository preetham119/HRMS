import { NextResponse } from 'next/server';
import { AuthError, requireMembership, requirePrisma } from '@/lib/auth/session';

function formatProfile(profile: {
  employeeId: string;
  fullName: string;
  designation: string;
  department: string;
  manager: string;
  location: string;
  employmentType: string;
  joiningDate: Date;
  status: string;
  personalEmail: string | null;
  officialEmail: string | null;
  mobile: string | null;
  emergencyContact: string | null;
  currentAddress: string | null;
  permanentAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
}) {
  const parts = profile.fullName.split(' ').filter(Boolean);
  return {
    employeeId: profile.employeeId,
    firstName: parts[0] ?? '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    maritalStatus: '',
    nationality: '',
    personalEmail: profile.personalEmail ?? '',
    personalMobileCountryCode: '+91',
    personalMobile: '',
    officialEmail: profile.officialEmail ?? '',
    mobile: profile.mobile ?? '',
    emergencyContact: profile.emergencyContact ?? '',
    currentAddress: profile.currentAddress ?? '',
    permanentAddress: profile.permanentAddress ?? '',
    currentAddressLine1: profile.currentAddress ?? '',
    currentAddressLine2: '',
    currentCity: profile.city ?? '',
    currentState: profile.state ?? '',
    currentCountry: profile.country ?? '',
    currentPincode: profile.pincode ?? '',
    permanentAddressLine1: profile.permanentAddress ?? '',
    permanentAddressLine2: '',
    permanentCity: '',
    permanentState: '',
    permanentCountry: '',
    permanentPincode: '',
    sameAsCurrentAddress: true,
    emergencyContacts: [],
    bankDetails: {},
    socialProfiles: {},
    city: profile.city ?? '',
    state: profile.state ?? '',
    country: profile.country ?? '',
    pincode: profile.pincode ?? '',
    department: profile.department,
    designation: profile.designation,
    manager: profile.manager,
    joiningDate: profile.joiningDate.toISOString().slice(0, 10),
    profilePicture: undefined,
    location: profile.location,
    employmentType: profile.employmentType,
    status: profile.status,
  };
}

export async function GET() {
  try {
    const membership = await requireMembership();
    const db = requirePrisma();
    const profile = await db.employeeProfile.findUnique({
      where: {
        companyId_employeeId: {
          companyId: membership.companyId,
          employeeId: membership.employeeId,
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(formatProfile(profile));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const membership = await requireMembership();
    const body = await request.json();
    const db = requirePrisma();

    const fullName =
      [body.firstName, body.middleName, body.lastName].filter(Boolean).join(' ').trim() ||
      membership.name;

    const currentAddress =
      body.currentAddress ||
      [body.currentAddressLine1, body.currentAddressLine2].filter(Boolean).join(', ');
    const permanentAddress =
      body.permanentAddress ||
      [body.permanentAddressLine1, body.permanentAddressLine2].filter(Boolean).join(', ');

    const profile = await db.employeeProfile.update({
      where: {
        companyId_employeeId: {
          companyId: membership.companyId,
          employeeId: membership.employeeId,
        },
      },
      data: {
        fullName,
        personalEmail: body.personalEmail ?? undefined,
        officialEmail: body.officialEmail ?? undefined,
        mobile: body.mobile ?? undefined,
        emergencyContact: body.emergencyContact ?? undefined,
        currentAddress: currentAddress || undefined,
        permanentAddress: permanentAddress || undefined,
        city: body.currentCity ?? body.city ?? undefined,
        state: body.currentState ?? body.state ?? undefined,
        country: body.currentCountry ?? body.country ?? undefined,
        pincode: body.currentPincode ?? body.pincode ?? undefined,
        designation: body.designation ?? undefined,
        department: body.department ?? undefined,
        location: body.location ?? undefined,
      },
    });

    await db.membership.update({
      where: { id: membership.membershipId },
      data: { name: fullName },
    });

    return NextResponse.json(formatProfile(profile));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
