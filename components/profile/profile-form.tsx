'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Edit2,
  Landmark,
  Link2,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import type { ProfileUpdatePayload } from '@/lib/employee-profile';

const relationshipOptions = ['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Son', 'Daughter', 'Guardian', 'Friend', 'Relative', 'Other'];
const genderOptions = ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const countryOptions = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'United Arab Emirates', 'Germany'];
const bankOptions = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Canara Bank'];

const profileSchema = z.object({
  employeeId: z.string().optional(),
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name must be at most 50 characters').regex(/^[A-Za-z\s]+$/, 'Only alphabets are allowed'),
  middleName: z.string().trim().max(50, 'Middle name must be at most 50 characters').optional().or(z.literal('')),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name must be at most 50 characters').regex(/^[A-Za-z\s]+$/, 'Only alphabets are allowed'),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  personalEmail: z.string().trim().email('Enter a valid email').or(z.literal('')),
  personalMobileCountryCode: z.string().optional(),
  personalMobile: z.string().trim().min(7, 'Enter a valid mobile number').max(15, 'Mobile number is too long').optional().or(z.literal('')),
  officialEmail: z.string().trim().email('Enter a valid official email').or(z.literal('')),
  mobile: z.string().trim().min(7, 'Enter a valid phone number').optional().or(z.literal('')),
  emergencyContact: z.string().trim().min(7, 'Enter a valid emergency contact').optional().or(z.literal('')),
  currentAddressLine1: z.string().trim().min(1, 'Address line 1 is required'),
  currentAddressLine2: z.string().optional().or(z.literal('')),
  currentCity: z.string().trim().min(1, 'City is required'),
  currentState: z.string().trim().min(1, 'State is required'),
  currentCountry: z.string().trim().min(1, 'Country is required'),
  currentPincode: z.string().trim().min(3, 'Enter a valid postal code'),
  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional().or(z.literal('')),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  permanentCountry: z.string().optional(),
  permanentPincode: z.string().optional(),
  sameAsCurrentAddress: z.boolean().default(true),
  emergencyContacts: z.array(
    z.object({
      id: z.string(),
      contactName: z.string().trim().min(1, 'Contact name is required'),
      relationship: z.string().trim().min(1, 'Relationship is required'),
      mobile: z.string().trim().min(7, 'Enter a valid mobile number'),
      alternateNumber: z.string().trim().optional().or(z.literal('')),
      email: z.string().trim().email('Enter a valid email').or(z.literal('')),
      address: z.string().trim().optional().or(z.literal('')),
    })
  ).default([]),
  bankDetails: z.object({
    accountHolderName: z.string().trim().min(1, 'Account holder name is required'),
    bankName: z.string().trim().min(1, 'Bank name is required'),
    branch: z.string().trim().min(1, 'Branch is required'),
    accountNumber: z.string().trim().min(4, 'Enter a valid account number'),
    confirmAccountNumber: z.string().trim().min(4, 'Enter a valid account number'),
    ifscCode: z.string().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code').optional().or(z.literal('')),
    upiId: z.string().trim().optional().or(z.literal('')),
    cancelledChequeUrl: z.string().optional().or(z.literal('')),
  }).superRefine((data, ctx) => {
    if (data.accountNumber && data.confirmAccountNumber && data.accountNumber !== data.confirmAccountNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Account numbers do not match', path: ['confirmAccountNumber'] });
    }
  }),
  socialProfiles: z.object({
    linkedIn: z.string().trim().optional().or(z.literal('')),
    github: z.string().trim().optional().or(z.literal('')),
    portfolioWebsite: z.string().trim().optional().or(z.literal('')),
  }).default({ linkedIn: '', github: '', portfolioWebsite: '' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  data: ProfileUpdatePayload;
  onSave: (values: ProfileUpdatePayload) => Promise<void>;
}

function normalizeUrl(value?: string) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function inputClassName(hasError: boolean, isReadonly: boolean) {
  return `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-brand-500 ${
    isReadonly ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white text-slate-900'
  } ${hasError ? 'border-rose-500' : 'border-slate-200'}`;
}

export function ProfileForm({ data, onSave }: ProfileFormProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);
  const [dateOfBirthLocked, setDateOfBirthLocked] = useState(Boolean(data.dateOfBirth));
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    contact: true,
    emergency: true,
    bank: true,
    social: true,
  });

  const defaultValues = useMemo<ProfileFormValues>(() => ({
    employeeId: data.employeeId ?? '',
    firstName: data.firstName ?? '',
    middleName: data.middleName ?? '',
    lastName: data.lastName ?? '',
    gender: data.gender ?? '',
    dateOfBirth: data.dateOfBirth ?? '',
    bloodGroup: data.bloodGroup ?? '',
    maritalStatus: data.maritalStatus ?? '',
    nationality: data.nationality ?? '',
    personalEmail: data.personalEmail ?? '',
    personalMobileCountryCode: data.personalMobileCountryCode ?? '+91',
    personalMobile: data.personalMobile ?? '',
    officialEmail: data.officialEmail ?? '',
    mobile: data.mobile ?? '',
    emergencyContact: data.emergencyContact ?? '',
    currentAddressLine1: data.currentAddressLine1 ?? '',
    currentAddressLine2: data.currentAddressLine2 ?? '',
    currentCity: data.currentCity ?? '',
    currentState: data.currentState ?? '',
    currentCountry: data.currentCountry ?? 'India',
    currentPincode: data.currentPincode ?? '',
    permanentAddressLine1: data.permanentAddressLine1 ?? '',
    permanentAddressLine2: data.permanentAddressLine2 ?? '',
    permanentCity: data.permanentCity ?? '',
    permanentState: data.permanentState ?? '',
    permanentCountry: data.permanentCountry ?? 'India',
    permanentPincode: data.permanentPincode ?? '',
    sameAsCurrentAddress: data.sameAsCurrentAddress ?? true,
    emergencyContacts: data.emergencyContacts?.length ? data.emergencyContacts : [{ id: crypto.randomUUID(), contactName: '', relationship: '', mobile: '', alternateNumber: '', email: '', address: '' as string }],
    bankDetails: {
      accountHolderName: data.bankDetails?.accountHolderName ?? '',
      bankName: data.bankDetails?.bankName ?? '',
      branch: data.bankDetails?.branch ?? '',
      accountNumber: data.bankDetails?.accountNumber ?? '',
      confirmAccountNumber: data.bankDetails?.confirmAccountNumber ?? '',
      ifscCode: data.bankDetails?.ifscCode ?? '',
      upiId: data.bankDetails?.upiId ?? '',
      cancelledChequeUrl: data.bankDetails?.cancelledChequeUrl ?? '',
    },
    socialProfiles: {
      linkedIn: data.socialProfiles?.linkedIn ?? '',
      github: data.socialProfiles?.github ?? '',
      portfolioWebsite: data.socialProfiles?.portfolioWebsite ?? '',
    },
  }), [data]);

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyContacts',
  });

  const sameAsCurrentAddress = watch('sameAsCurrentAddress');
  const currentAddressValues = watch(['currentAddressLine1', 'currentAddressLine2', 'currentCity', 'currentState', 'currentCountry', 'currentPincode']);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!sameAsCurrentAddress) return;
    setValue('permanentAddressLine1', currentAddressValues[0] ?? '', { shouldDirty: true });
    setValue('permanentAddressLine2', currentAddressValues[1] ?? '', { shouldDirty: true });
    setValue('permanentCity', currentAddressValues[2] ?? '', { shouldDirty: true });
    setValue('permanentState', currentAddressValues[3] ?? '', { shouldDirty: true });
    setValue('permanentCountry', currentAddressValues[4] ?? '', { shouldDirty: true });
    setValue('permanentPincode', currentAddressValues[5] ?? '', { shouldDirty: true });
  }, [sameAsCurrentAddress, currentAddressValues, setValue]);

  useEffect(() => {
    if (!isEditable || !isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditable, isDirty]);

  const cancel = () => {
    reset(defaultValues);
    setIsEditable(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const toggleSection = (key: string) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const buildPayload = (values: ProfileFormValues): ProfileUpdatePayload => {
    const payload: Partial<ProfileUpdatePayload> = {};

    const appendIfChanged = (key: keyof ProfileFormValues, value: unknown) => {
      const initialValue = defaultValues[key];
      const isChanged = JSON.stringify(initialValue) !== JSON.stringify(value);
      if (isChanged) {
        (payload as Record<string, unknown>)[key as string] = value;
      }
    };

    appendIfChanged('firstName', values.firstName);
    appendIfChanged('middleName', values.middleName);
    appendIfChanged('lastName', values.lastName);
    appendIfChanged('gender', values.gender);
    appendIfChanged('dateOfBirth', values.dateOfBirth);
    appendIfChanged('bloodGroup', values.bloodGroup);
    appendIfChanged('maritalStatus', values.maritalStatus);
    appendIfChanged('nationality', values.nationality);
    appendIfChanged('personalEmail', values.personalEmail);
    appendIfChanged('personalMobileCountryCode', values.personalMobileCountryCode);
    appendIfChanged('personalMobile', values.personalMobile);
    appendIfChanged('officialEmail', values.officialEmail);
    appendIfChanged('mobile', values.mobile);
    appendIfChanged('emergencyContact', values.emergencyContact);
    appendIfChanged('currentAddressLine1', values.currentAddressLine1);
    appendIfChanged('currentAddressLine2', values.currentAddressLine2);
    appendIfChanged('currentCity', values.currentCity);
    appendIfChanged('currentState', values.currentState);
    appendIfChanged('currentCountry', values.currentCountry);
    appendIfChanged('currentPincode', values.currentPincode);
    appendIfChanged('permanentAddressLine1', values.permanentAddressLine1);
    appendIfChanged('permanentAddressLine2', values.permanentAddressLine2);
    appendIfChanged('permanentCity', values.permanentCity);
    appendIfChanged('permanentState', values.permanentState);
    appendIfChanged('permanentCountry', values.permanentCountry);
    appendIfChanged('permanentPincode', values.permanentPincode);
    appendIfChanged('sameAsCurrentAddress', values.sameAsCurrentAddress);
    appendIfChanged('emergencyContacts', values.emergencyContacts);
    appendIfChanged('bankDetails', values.bankDetails);
    appendIfChanged('socialProfiles', values.socialProfiles);

    const normalizedSocialProfiles = {
      linkedIn: normalizeUrl(values.socialProfiles.linkedIn),
      github: normalizeUrl(values.socialProfiles.github),
      portfolioWebsite: normalizeUrl(values.socialProfiles.portfolioWebsite),
    };

    const updatedPayload: ProfileUpdatePayload = {
      employeeId: values.employeeId ?? data.employeeId ?? '',
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      bloodGroup: values.bloodGroup,
      maritalStatus: values.maritalStatus,
      nationality: values.nationality,
      personalEmail: values.personalEmail,
      personalMobileCountryCode: values.personalMobileCountryCode ?? '+91',
      personalMobile: values.personalMobile ?? '',
      officialEmail: values.officialEmail,
      mobile: values.mobile ?? '',
      emergencyContact: values.emergencyContact ?? '',
      currentAddress: [values.currentAddressLine1, values.currentAddressLine2].filter(Boolean).join(', '),
      permanentAddress: sameAsCurrentAddress
        ? [values.currentAddressLine1, values.currentAddressLine2].filter(Boolean).join(', ')
        : [values.permanentAddressLine1, values.permanentAddressLine2].filter(Boolean).join(', '),
      currentAddressLine1: values.currentAddressLine1,
      currentAddressLine2: values.currentAddressLine2,
      currentCity: values.currentCity,
      currentState: values.currentState,
      currentCountry: values.currentCountry,
      currentPincode: values.currentPincode,
      permanentAddressLine1: values.permanentAddressLine1,
      permanentAddressLine2: values.permanentAddressLine2,
      permanentCity: values.permanentCity,
      permanentState: values.permanentState,
      permanentCountry: values.permanentCountry,
      permanentPincode: values.permanentPincode,
      sameAsCurrentAddress: values.sameAsCurrentAddress,
      emergencyContacts: values.emergencyContacts.map((contact) => ({
        ...contact,
        alternateNumber: contact.alternateNumber ?? '',
        email: contact.email ?? '',
        address: contact.address ?? '',
      })),
      bankDetails: {
        ...values.bankDetails,
        ifscCode: values.bankDetails.ifscCode?.toUpperCase() ?? '',
      },
      socialProfiles: normalizedSocialProfiles,
    };

    return { ...updatedPayload, ...payload } as ProfileUpdatePayload;
  };

  const save = async (values: ProfileFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const payload = buildPayload(values);
      await onSave(payload);
      setSuccessMessage('Profile details updated successfully.');
      setDateOfBirthLocked(Boolean(values.dateOfBirth));
      setIsEditable(false);
      reset(values);
    } catch (error) {
      setErrorMessage('Unable to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-600">My Profile</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Profile details</h1>
          <p className="mt-2 text-sm text-slate-500">Keep personal, address, emergency, banking, and social information aligned and up to date.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isEditable ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={cancel}
                className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
              >
                <X className="mr-2 inline h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(save)}
                disabled={isSaving || !isDirty}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditable(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              Edit profile
            </button>
          )}
        </div>
      </div>

      {(successMessage || errorMessage) ? (
        <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${errorMessage ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          <div className="flex items-center gap-2">
            {errorMessage ? <AlertCircle className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            <span>{errorMessage ?? successMessage}</span>
          </div>
        </div>
      ) : null}

      <form noValidate>
        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <button
              type="button"
              onClick={() => toggleSection('personal')}
              className="mb-4 flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-100 p-2 text-brand-700">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">1. Personal Information</h2>
                  <p className="text-sm text-slate-500">Core identity and demographic details.</p>
                </div>
              </div>
              {expandedSections.personal ? <ChevronUp className="h-5 w-5 text-slate-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-slate-500" aria-hidden="true" />}
            </button>
            {expandedSections.personal ? (
              <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Employee ID</div>
                <input {...register('employeeId')} readOnly className={inputClassName(false, true)} aria-label="Employee ID" />
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">First name <span className="text-rose-600">*</span></div>
                <input {...register('firstName')} readOnly={!isEditable} className={inputClassName(Boolean(errors.firstName), !isEditable)} aria-invalid={Boolean(errors.firstName)} aria-label="First name" />
                {errors.firstName ? <p className="text-sm text-rose-600">{errors.firstName.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Middle name</div>
                <input {...register('middleName')} readOnly={!isEditable} className={inputClassName(Boolean(errors.middleName), !isEditable)} aria-label="Middle name" />
                {errors.middleName ? <p className="text-sm text-rose-600">{errors.middleName.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Last name <span className="text-rose-600">*</span></div>
                <input {...register('lastName')} readOnly={!isEditable} className={inputClassName(Boolean(errors.lastName), !isEditable)} aria-invalid={Boolean(errors.lastName)} aria-label="Last name" />
                {errors.lastName ? <p className="text-sm text-rose-600">{errors.lastName.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Gender</div>
                <select {...register('gender')} disabled={!isEditable} className={inputClassName(Boolean(errors.gender), !isEditable)} aria-label="Gender">
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Date of birth</div>
                <div className="flex items-center gap-2">
                  <input {...register('dateOfBirth')} type="date" disabled={!isEditable || dateOfBirthLocked} className={inputClassName(Boolean(errors.dateOfBirth), !isEditable || dateOfBirthLocked)} aria-label="Date of birth" />
                  {dateOfBirthLocked ? <span className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-600">Locked</span> : null}
                </div>
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Blood group</div>
                <select {...register('bloodGroup')} disabled={!isEditable} className={inputClassName(Boolean(errors.bloodGroup), !isEditable)} aria-label="Blood group">
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Marital status</div>
                <select {...register('maritalStatus')} disabled={!isEditable} className={inputClassName(Boolean(errors.maritalStatus), !isEditable)} aria-label="Marital status">
                  <option value="">Select marital status</option>
                  {maritalStatuses.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Nationality</div>
                <input {...register('nationality')} list="nationality-options" readOnly={!isEditable} className={inputClassName(Boolean(errors.nationality), !isEditable)} aria-label="Nationality" />
                <datalist id="nationality-options">
                  {countryOptions.map((country) => <option key={country} value={country} />)}
                </datalist>
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Personal email</div>
                <input {...register('personalEmail')} type="email" readOnly={!isEditable} className={inputClassName(Boolean(errors.personalEmail), !isEditable)} aria-invalid={Boolean(errors.personalEmail)} aria-label="Personal email" />
                {errors.personalEmail ? <p className="text-sm text-rose-600">{errors.personalEmail.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Personal mobile number</div>
                <div className="flex gap-2">
                  <input {...register('personalMobileCountryCode')} readOnly={!isEditable} className={`w-24 rounded-2xl border px-3 py-3 text-sm ${!isEditable ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white text-slate-900'}`} aria-label="Country code" />
                  <input {...register('personalMobile')} type="tel" readOnly={!isEditable} className={`flex-1 rounded-2xl border px-4 py-3 text-sm ${!isEditable ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white text-slate-900'}`} aria-label="Personal mobile number" />
                </div>
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Official email</div>
                <input {...register('officialEmail')} type="email" readOnly className={inputClassName(Boolean(errors.officialEmail), true)} aria-invalid={Boolean(errors.officialEmail)} aria-label="Official email" />
                {errors.officialEmail ? <p className="text-sm text-rose-600">{errors.officialEmail.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Mobile number</div>
                <input {...register('mobile')} type="tel" readOnly={!isEditable} className={inputClassName(Boolean(errors.mobile), !isEditable)} aria-label="Mobile number" />
                {errors.mobile ? <p className="text-sm text-rose-600">{errors.mobile.message}</p> : null}
              </label>
            </div>
            ) : null}
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="mb-4 flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-100 p-2 text-brand-700">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">2. Contact Information</h2>
                  <p className="text-sm text-slate-500">Current and permanent address details.</p>
                </div>
              </div>
              {expandedSections.contact ? <ChevronUp className="h-5 w-5 text-slate-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-slate-500" aria-hidden="true" />}
            </button>
            {expandedSections.contact ? (
              <div className="space-y-6">
              <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  <h3 className="font-semibold text-slate-900">Current address</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Address line 1 <span className="text-rose-600">*</span></div>
                    <input {...register('currentAddressLine1')} readOnly={!isEditable} className={inputClassName(Boolean(errors.currentAddressLine1), !isEditable)} aria-invalid={Boolean(errors.currentAddressLine1)} aria-label="Current address line 1" />
                    {errors.currentAddressLine1 ? <p className="text-sm text-rose-600">{errors.currentAddressLine1.message}</p> : null}
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Address line 2</div>
                    <input {...register('currentAddressLine2')} readOnly={!isEditable} className={inputClassName(Boolean(errors.currentAddressLine2), !isEditable)} aria-label="Current address line 2" />
                  </label>
                  <label className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">City <span className="text-rose-600">*</span></div>
                    <input {...register('currentCity')} readOnly={!isEditable} className={inputClassName(Boolean(errors.currentCity), !isEditable)} aria-label="Current city" />
                    {errors.currentCity ? <p className="text-sm text-rose-600">{errors.currentCity.message}</p> : null}
                  </label>
                  <label className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">State <span className="text-rose-600">*</span></div>
                    <input {...register('currentState')} readOnly={!isEditable} className={inputClassName(Boolean(errors.currentState), !isEditable)} aria-label="Current state" />
                    {errors.currentState ? <p className="text-sm text-rose-600">{errors.currentState.message}</p> : null}
                  </label>
                  <label className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Country <span className="text-rose-600">*</span></div>
                    <input {...register('currentCountry')} list="current-country-options" readOnly={!isEditable} className={inputClassName(Boolean(errors.currentCountry), !isEditable)} aria-label="Current country" />
                    <datalist id="current-country-options">
                      {countryOptions.map((country) => <option key={country} value={country} />)}
                    </datalist>
                  </label>
                  <label className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Pincode <span className="text-rose-600">*</span></div>
                    <input {...register('currentPincode')} inputMode="numeric" readOnly={!isEditable} className={inputClassName(Boolean(errors.currentPincode), !isEditable)} aria-label="Current pincode" />
                    {errors.currentPincode ? <p className="text-sm text-rose-600">{errors.currentPincode.message}</p> : null}
                  </label>
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input {...register('sameAsCurrentAddress')} type="checkbox" disabled={!isEditable} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>Same as current address</span>
                </label>
                <div className="mt-4 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  <h3 className="font-semibold text-slate-900">Permanent address</h3>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Address line 1</div>
                    <input {...register('permanentAddressLine1')} readOnly={!isEditable || sameAsCurrentAddress} className={inputClassName(Boolean(errors.permanentAddressLine1), !isEditable || sameAsCurrentAddress)} aria-label="Permanent address line 1" />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Address line 2</div>
                    <input {...register('permanentAddressLine2')} readOnly={!isEditable || sameAsCurrentAddress} className={inputClassName(Boolean(errors.permanentAddressLine2), !isEditable || sameAsCurrentAddress)} aria-label="Permanent address line 2" />
                  </label>
                  <label className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">City</div>
                    <input {...register('permanentCity')} readOnly={!isEditable || sameAsCurrentAddress} className={inputClassName(Boolean(errors.permanentCity), !isEditable || sameAsCurrentAddress)} aria-label="Permanent city" />
                  </label>
                  <label className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">State</div>
                    <input {...register('permanentState')} readOnly={!isEditable || sameAsCurrentAddress} className={inputClassName(Boolean(errors.permanentState), !isEditable || sameAsCurrentAddress)} aria-label="Permanent state" />
                  </label>
                  <label className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Country</div>
                    <input {...register('permanentCountry')} list="permanent-country-options" readOnly={!isEditable || sameAsCurrentAddress} className={inputClassName(Boolean(errors.permanentCountry), !isEditable || sameAsCurrentAddress)} aria-label="Permanent country" />
                    <datalist id="permanent-country-options">
                      {countryOptions.map((country) => <option key={country} value={country} />)}
                    </datalist>
                  </label>
                  <label className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Pincode</div>
                    <input {...register('permanentPincode')} inputMode="numeric" readOnly={!isEditable || sameAsCurrentAddress} className={inputClassName(Boolean(errors.permanentPincode), !isEditable || sameAsCurrentAddress)} aria-label="Permanent pincode" />
                  </label>
                </div>
              </div>
            </div>
            ) : null}
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <button
              type="button"
              onClick={() => toggleSection('emergency')}
              className="mb-4 flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-100 p-2 text-brand-700">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">3. Emergency Contacts</h2>
                  <p className="text-sm text-slate-500">Primary contacts for urgent support.</p>
                </div>
              </div>
              {expandedSections.emergency ? <ChevronUp className="h-5 w-5 text-slate-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-slate-500" aria-hidden="true" />}
            </button>
            {expandedSections.emergency ? (
              <>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Contact {index + 1}</h3>
                        {isEditable ? (
                          <button type="button" onClick={() => remove(index)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Contact name <span className="text-rose-600">*</span></div>
                          <input {...register(`emergencyContacts.${index}.contactName` as const)} readOnly={!isEditable} className={inputClassName(Boolean(errors.emergencyContacts?.[index]?.contactName), !isEditable)} aria-label={`Emergency contact name ${index + 1}`} />
                          {errors.emergencyContacts?.[index]?.contactName ? <p className="text-sm text-rose-600">{errors.emergencyContacts[index].contactName?.message}</p> : null}
                        </label>
                        <label className="space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Relationship <span className="text-rose-600">*</span></div>
                          <select {...register(`emergencyContacts.${index}.relationship` as const)} disabled={!isEditable} className={inputClassName(Boolean(errors.emergencyContacts?.[index]?.relationship), !isEditable)} aria-label={`Emergency relationship ${index + 1}`}>
                            <option value="">Select relationship</option>
                            {relationshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                          {errors.emergencyContacts?.[index]?.relationship ? <p className="text-sm text-rose-600">{errors.emergencyContacts[index].relationship?.message}</p> : null}
                        </label>
                        <label className="space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Mobile number <span className="text-rose-600">*</span></div>
                          <input {...register(`emergencyContacts.${index}.mobile` as const)} type="tel" readOnly={!isEditable} className={inputClassName(Boolean(errors.emergencyContacts?.[index]?.mobile), !isEditable)} aria-label={`Emergency mobile ${index + 1}`} />
                          {errors.emergencyContacts?.[index]?.mobile ? <p className="text-sm text-rose-600">{errors.emergencyContacts[index].mobile?.message}</p> : null}
                        </label>
                        <label className="space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Alternate number</div>
                          <input {...register(`emergencyContacts.${index}.alternateNumber` as const)} type="tel" readOnly={!isEditable} className={inputClassName(Boolean(errors.emergencyContacts?.[index]?.alternateNumber), !isEditable)} aria-label={`Emergency alternate number ${index + 1}`} />
                        </label>
                        <label className="space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Email</div>
                          <input {...register(`emergencyContacts.${index}.email` as const)} type="email" readOnly={!isEditable} className={inputClassName(Boolean(errors.emergencyContacts?.[index]?.email), !isEditable)} aria-label={`Emergency contact email ${index + 1}`} />
                          {errors.emergencyContacts?.[index]?.email ? <p className="text-sm text-rose-600">{errors.emergencyContacts[index].email?.message}</p> : null}
                        </label>
                        <label className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Address</div>
                          <textarea {...register(`emergencyContacts.${index}.address` as const)} rows={3} readOnly={!isEditable} className={inputClassName(Boolean(errors.emergencyContacts?.[index]?.address), !isEditable)} aria-label={`Emergency address ${index + 1}`} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {isEditable ? (
                  <button type="button" onClick={() => append({ id: crypto.randomUUID(), contactName: '', relationship: '', mobile: '', alternateNumber: '', email: '', address: '' })} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                    <PlusCircle className="h-4 w-4" aria-hidden="true" />
                    Add contact
                  </button>
                ) : null}
              </>
            ) : null}
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <button
              type="button"
              onClick={() => toggleSection('bank')}
              className="mb-4 flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-100 p-2 text-brand-700">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">4. Bank Details</h2>
                  <p className="text-sm text-slate-500">Secure payment and salary disbursement information.</p>
                </div>
              </div>
              {expandedSections.bank ? <ChevronUp className="h-5 w-5 text-slate-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-slate-500" aria-hidden="true" />}
            </button>
            {expandedSections.bank ? (
              <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Account holder name <span className="text-rose-600">*</span></div>
                <input {...register('bankDetails.accountHolderName')} readOnly={!isEditable} className={inputClassName(Boolean(errors.bankDetails?.accountHolderName), !isEditable)} aria-label="Account holder name" />
                {errors.bankDetails?.accountHolderName ? <p className="text-sm text-rose-600">{errors.bankDetails.accountHolderName.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Bank name <span className="text-rose-600">*</span></div>
                <input {...register('bankDetails.bankName')} list="bank-name-options" readOnly={!isEditable} className={inputClassName(Boolean(errors.bankDetails?.bankName), !isEditable)} aria-label="Bank name" />
                <datalist id="bank-name-options">
                  {bankOptions.map((bank) => <option key={bank} value={bank} />)}
                </datalist>
                {errors.bankDetails?.bankName ? <p className="text-sm text-rose-600">{errors.bankDetails.bankName.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Branch <span className="text-rose-600">*</span></div>
                <input {...register('bankDetails.branch')} readOnly={!isEditable} className={inputClassName(Boolean(errors.bankDetails?.branch), !isEditable)} aria-label="Branch" />
                {errors.bankDetails?.branch ? <p className="text-sm text-rose-600">{errors.bankDetails.branch.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Account number <span className="text-rose-600">*</span></div>
                <input {...register('bankDetails.accountNumber')} type={showAccountNumber ? 'text' : 'password'} readOnly={!isEditable} className={inputClassName(Boolean(errors.bankDetails?.accountNumber), !isEditable)} aria-label="Account number" />
                {errors.bankDetails?.accountNumber ? <p className="text-sm text-rose-600">{errors.bankDetails.accountNumber.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Confirm account number <span className="text-rose-600">*</span></div>
                <input {...register('bankDetails.confirmAccountNumber')} type={showConfirmAccountNumber ? 'text' : 'password'} readOnly={!isEditable} className={inputClassName(Boolean(errors.bankDetails?.confirmAccountNumber), !isEditable)} aria-label="Confirm account number" />
                {errors.bankDetails?.confirmAccountNumber ? <p className="text-sm text-rose-600">{errors.bankDetails.confirmAccountNumber.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">IFSC code</div>
                <input {...register('bankDetails.ifscCode')} readOnly={!isEditable} className={inputClassName(Boolean(errors.bankDetails?.ifscCode), !isEditable)} aria-label="IFSC code" onInput={(event) => {
                  const target = event.currentTarget;
                  target.value = target.value.toUpperCase();
                }} />
                {errors.bankDetails?.ifscCode ? <p className="text-sm text-rose-600">{errors.bankDetails.ifscCode.message}</p> : null}
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">UPI ID</div>
                <input {...register('bankDetails.upiId')} readOnly={!isEditable} className={inputClassName(Boolean(errors.bankDetails?.upiId), !isEditable)} aria-label="UPI ID" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Cancelled cheque upload</div>
                <input type="file" accept="application/pdf,image/png,image/jpeg,image/jpg" disabled={!isEditable} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" aria-label="Cancelled cheque upload" />
                <p className="text-sm text-slate-500">Allowed formats: PDF, JPG, JPEG, PNG. Maximum size: 5 MB.</p>
              </label>
            </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => setShowAccountNumber((value) => !value)} className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                {showAccountNumber ? 'Hide account number' : 'Show account number'}
              </button>
              <button type="button" onClick={() => setShowConfirmAccountNumber((value) => !value)} className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                {showConfirmAccountNumber ? 'Hide confirm number' : 'Show confirm number'}
              </button>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <button
              type="button"
              onClick={() => toggleSection('social')}
              className="mb-4 flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-100 p-2 text-brand-700">
                  <Link2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">5. Social Profiles</h2>
                  <p className="text-sm text-slate-500">LinkedIn, GitHub, and portfolio links.</p>
                </div>
              </div>
              {expandedSections.social ? <ChevronUp className="h-5 w-5 text-slate-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-slate-500" aria-hidden="true" />}
            </button>
            {expandedSections.social ? (
              <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">LinkedIn</div>
                <input {...register('socialProfiles.linkedIn')} readOnly={!isEditable} className={inputClassName(Boolean(errors.socialProfiles?.linkedIn), !isEditable)} aria-label="LinkedIn" />
              </label>
              <label className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">GitHub</div>
                <input {...register('socialProfiles.github')} readOnly={!isEditable} className={inputClassName(Boolean(errors.socialProfiles?.github), !isEditable)} aria-label="GitHub" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">Portfolio website</div>
                <input {...register('socialProfiles.portfolioWebsite')} readOnly={!isEditable} className={inputClassName(Boolean(errors.socialProfiles?.portfolioWebsite), !isEditable)} aria-label="Portfolio website" />
              </label>
            </div>
            ) : null}
          </section>
        </div>
      </form>
    </section>
  );
}
