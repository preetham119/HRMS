'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, UserCircle2 } from 'lucide-react';
import { ProfileForm } from '@/components/profile/profile-form';
import { fetchEmployeeProfile, type EmployeeProfile, type ProfileUpdatePayload, updateEmployeeProfile } from '@/lib/employee-profile';
import { useAuth } from '@/components/providers/auth-provider';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchEmployeeProfile();
        if (isMounted) {
          setProfile(result);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load profile details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const defaultValues = useMemo<ProfileUpdatePayload | null>(() => {
    if (!profile) return null;
    return {
      employeeId: profile.employeeId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      personalEmail: profile.personalEmail,
      officialEmail: profile.officialEmail,
      mobile: profile.mobile,
      emergencyContact: profile.emergencyContact,
      currentAddress: profile.currentAddress,
      permanentAddress: profile.permanentAddress,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      pincode: profile.pincode,
    };
  }, [profile]);

  const handleSave = async (values: ProfileUpdatePayload) => {
    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateEmployeeProfile(values);

      setProfile(updated);
      updateUser({
        employeeId: updated.employeeId,
        name: `${updated.firstName} ${updated.lastName}`.trim(),
        department: updated.department,
        profilePicture: updated.profilePicture ?? profile?.profilePicture ?? null,
      });
    } catch (err) {
      setError('Unable to save profile changes. Please try again.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-40 rounded-full bg-slate-200" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-24 rounded-[24px] bg-slate-200" />
                <div className="h-24 rounded-[24px] bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile || error) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-rose-700">{error ?? 'Profile not found.'}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-[24px] bg-brand-50 text-brand-700">
                  {profile.profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.profilePicture} alt="Profile" className="h-24 w-24 object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center">
                      <UserCircle2 className="h-12 w-12" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <label className="absolute -right-2 -bottom-2 flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1 text-sm shadow sm:-right-3 sm:-bottom-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const dataUrl = reader.result as string;
                        try {
                          setIsSaving(true);
                          const updated = await updateEmployeeProfile({
                            employeeId: profile.employeeId,
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            personalEmail: profile.personalEmail,
                            officialEmail: profile.officialEmail,
                            mobile: profile.mobile,
                            emergencyContact: profile.emergencyContact,
                            currentAddress: profile.currentAddress,
                            permanentAddress: profile.permanentAddress,
                            city: profile.city,
                            state: profile.state,
                            country: profile.country,
                            pincode: profile.pincode,
                            profilePicture: dataUrl,
                          } as any);
                          setProfile(updated);
                          updateUser({
                            profilePicture: updated.profilePicture ?? dataUrl,
                            name: `${updated.firstName} ${updated.lastName}`,
                          });
                        } catch (err) {
                          setError('Unable to upload profile picture.');
                        } finally {
                          setIsSaving(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7M8 21h8M12 7v10" />
                  </svg>
                  <span className="hidden text-sm text-slate-700 sm:inline">Upload</span>
                </label>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Personal profile</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">{profile.firstName} {profile.lastName}</h1>
                <p className="mt-2 text-sm text-slate-500">Review and update your personal contact details securely.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600"></p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900"></h2>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <span>Secure updates</span>
              </div>
            </div>
          </div>

          {defaultValues ? (
            <ProfileForm data={defaultValues} onSave={handleSave} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Unable to load editable profile values.</div>
          )}

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        </motion.section>
      </div>
    </main>
  );
}
