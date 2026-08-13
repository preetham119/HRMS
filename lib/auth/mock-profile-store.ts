import type { AppRole } from '@/lib/auth';
import { syncMockMemberProfile } from '@/lib/auth/mock-company-store';
import { MOCK_USERS, type MockUser } from '@/lib/auth/mock-users';

export type MockEmployeeProfile = {
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
  profilePicture?: string | null;
};

/** Keep designations/managers aligned with appraisal seed + role demos. */
const PROFILE_OVERRIDES: Record<
  string,
  Partial<Pick<MockEmployeeProfile, 'designation' | 'manager' | 'location' | 'department'>>
> = {
  EMP001: {
    designation: 'Senior QA Lead',
    manager: 'Anita Desai',
    department: 'Quality Assurance',
    location: 'Hyderabad, India',
  },
  EMP002: {
    designation: 'Frontend Developer',
    manager: 'Anita Desai',
    department: 'Engineering',
    location: 'Bengaluru, India',
  },
  EMP003: {
    designation: 'Backend Developer',
    manager: 'Anita Desai',
    department: 'Engineering',
    location: 'Bengaluru, India',
  },
  EMP004: {
    designation: 'Engineering Manager',
    manager: 'Arjun Mehta',
    location: 'Bengaluru, India',
  },
  EMP005: {
    designation: 'HR Manager',
    manager: 'Arjun Mehta',
    location: 'Hyderabad, India',
  },
  EMP006: {
    designation: 'Finance Lead',
    manager: 'Arjun Mehta',
    location: 'Mumbai, India',
  },
  EMP007: {
    designation: 'System Administrator',
    manager: 'Board',
    location: 'Hyderabad, India',
  },
  EMP008: {
    designation: 'Chief Executive Officer',
    manager: 'Board',
    location: 'Hyderabad, India',
  },
};

const STORE_VERSION = 4;

declare global {
  // eslint-disable-next-line no-var
  var __hrmsMockProfileStore: Record<string, MockEmployeeProfile> | undefined;
  // eslint-disable-next-line no-var
  var __hrmsMockProfileStoreVersion: number | undefined;
}

function designationForRole(role: AppRole) {
  switch (role) {
    case 'ADMIN':
      return 'System Administrator';
    case 'HR':
      return 'HR Manager';
    case 'MANAGER':
      return 'Engineering Manager';
    case 'FINANCE':
      return 'Finance Lead';
    case 'CEO':
      return 'Chief Executive Officer';
    case 'EMPLOYEE_CONT':
      return 'Contract Specialist';
    case 'EMPLOYEE_PR':
    default:
      return 'Software Engineer';
  }
}

function managerFor(user: MockUser) {
  if (user.role === 'CEO' || user.role === 'ADMIN') return 'Board';
  if (user.role === 'MANAGER' || user.role === 'HR' || user.role === 'FINANCE') return 'Arjun Mehta';
  return 'Anita Desai';
}

function createProfile(user: MockUser): MockEmployeeProfile {
  const overrides = PROFILE_OVERRIDES[user.employeeId] ?? {};
  return {
    employeeId: user.employeeId,
    fullName: user.name,
    designation: overrides.designation ?? designationForRole(user.role),
    department: overrides.department ?? user.department,
    manager: overrides.manager ?? managerFor(user),
    location: overrides.location ?? 'Bengaluru, India',
    employmentType: 'Full Time',
    joiningDate: new Date('2022-04-01'),
    status: 'Active',
    personalEmail: user.email.replace('@company.com', '@gmail.com'),
    officialEmail: user.email,
    mobile: '9876543210',
    emergencyContact: '9876501234',
    currentAddress: '12 MG Road, Indiranagar',
    permanentAddress: '12 MG Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '560038',
    profilePicture: null,
  };
}

function getStore() {
  if (!globalThis.__hrmsMockProfileStore || globalThis.__hrmsMockProfileStoreVersion !== STORE_VERSION) {
    globalThis.__hrmsMockProfileStore = Object.fromEntries(
      MOCK_USERS.map((user) => [user.employeeId, createProfile(user)]),
    );
    globalThis.__hrmsMockProfileStoreVersion = STORE_VERSION;
  }
  return globalThis.__hrmsMockProfileStore;
}

export function getMockProfile(employeeId: string) {
  return getStore()[employeeId] ?? null;
}

export function updateMockProfile(
  employeeId: string,
  updates: Partial<Omit<MockEmployeeProfile, 'employeeId' | 'joiningDate'>> & {
    joiningDate?: Date | string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    currentCity?: string;
    currentState?: string;
    currentCountry?: string;
    currentPincode?: string;
    currentAddressLine1?: string;
    currentAddressLine2?: string;
    permanentAddressLine1?: string;
    permanentAddressLine2?: string;
  },
) {
  const store = getStore();
  const current = store[employeeId];
  if (!current) return null;

  const fullName =
    [updates.firstName, updates.middleName, updates.lastName].filter(Boolean).join(' ').trim() ||
    updates.fullName ||
    current.fullName;

  const currentAddress =
    updates.currentAddress ||
    [updates.currentAddressLine1, updates.currentAddressLine2].filter(Boolean).join(', ') ||
    current.currentAddress;

  const permanentAddress =
    updates.permanentAddress ||
    [updates.permanentAddressLine1, updates.permanentAddressLine2].filter(Boolean).join(', ') ||
    current.permanentAddress;

  const next: MockEmployeeProfile = {
    ...current,
    fullName,
    personalEmail: updates.personalEmail ?? current.personalEmail,
    officialEmail: updates.officialEmail ?? current.officialEmail,
    mobile: updates.mobile ?? current.mobile,
    emergencyContact: updates.emergencyContact ?? current.emergencyContact,
    currentAddress,
    permanentAddress,
    city: updates.currentCity ?? updates.city ?? current.city,
    state: updates.currentState ?? updates.state ?? current.state,
    country: updates.currentCountry ?? updates.country ?? current.country,
    pincode: updates.currentPincode ?? updates.pincode ?? current.pincode,
    designation: updates.designation ?? current.designation,
    department: updates.department ?? current.department,
    location: updates.location ?? current.location,
    manager: updates.manager ?? current.manager,
    employmentType: updates.employmentType ?? current.employmentType,
    status: updates.status ?? current.status,
    profilePicture: updates.profilePicture ?? current.profilePicture,
  };

  store[employeeId] = next;
  syncMockMemberProfile(employeeId, { name: fullName, department: next.department });
  return next;
}
