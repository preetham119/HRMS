export interface EmergencyContact {
  id: string;
  contactName: string;
  relationship: string;
  mobile: string;
  alternateNumber: string;
  email: string;
  address: string;
}

export type PaymentMethod = 'cheque' | 'bank';

export interface BankDetails {
  paymentMethod?: PaymentMethod;
  accountHolderName?: string;
  bankName?: string;
  branch?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  cancelledChequeUrl?: string;
}

export interface SocialProfiles {
  linkedIn?: string;
  github?: string;
  portfolioWebsite?: string;
}

export interface EmployeeProfile {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  personalEmail: string;
  personalMobileCountryCode?: string;
  personalMobile?: string;
  officialEmail: string;
  mobile: string;
  emergencyContact: string;
  currentAddress: string;
  permanentAddress: string;
  currentAddressLine1?: string;
  currentAddressLine2?: string;
  currentCity?: string;
  currentState?: string;
  currentCountry?: string;
  currentPincode?: string;
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentCountry?: string;
  permanentPincode?: string;
  sameAsCurrentAddress?: boolean;
  emergencyContacts?: EmergencyContact[];
  bankDetails?: BankDetails;
  socialProfiles?: SocialProfiles;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  department: string;
  designation: string;
  manager: string;
  joiningDate: string;
  location: string;
  employmentType: string;
  status: string;
  profilePicture?: string;
}

export type ProfileUpdatePayload = Partial<EmployeeProfile> & {
  employeeId: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  officialEmail: string;
  mobile: string;
  emergencyContact: string;
  currentAddress: string;
  permanentAddress: string;
  profilePicture?: string;
};

const API_ROUTE = '/api/employee/profile';

export async function fetchEmployeeProfile(): Promise<EmployeeProfile> {
  const response = await fetch(API_ROUTE, { cache: 'no-store', credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load profile data.');
  }
  return response.json();
}

export async function updateEmployeeProfile(profile: ProfileUpdatePayload): Promise<EmployeeProfile> {
  const response = await fetch(API_ROUTE, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error('Failed to save profile data.');
  }

  return response.json();
}
