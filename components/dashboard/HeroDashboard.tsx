'use client';

import { FC, type ReactNode } from 'react';
import { BadgeCheck, Briefcase, Building2, Mail, MapPin, UserRound } from 'lucide-react';
import Greeting from './Greeting';
import ProfileAvatar from './ProfileAvatar';
import InfoPills from './InfoPills';
import QuickActions from './QuickActions';
import SkylineIllustration from './SkylineIllustration';

interface HeroProps {
  employeeId?: string;
  name?: string;
  designation?: string;
  department?: string;
  manager?: string;
  officialEmail?: string;
  status?: string;
  location?: string;
  photoUrl?: string | null;
  lastLogin?: string | null;
}

function InfoField({
  label,
  value,
  icon,
  iconClassName,
}: {
  label: string;
  value?: string;
  icon?: ReactNode;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon ? (
        <span
          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-sm ${iconClassName ?? 'bg-white/20 text-white'}`}
        >
          {icon}
        </span>
      ) : null}
      <div className="whitespace-nowrap">
        <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">{label}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-white">
          {value?.trim() ? value : '—'}
        </p>
      </div>
    </div>
  );
}

const HeroDashboard: FC<HeroProps> = ({
  employeeId = '',
  name = '',
  designation = '',
  department = '',
  manager = '',
  officialEmail = '',
  status = 'Active',
  location = '',
  photoUrl = null,
  lastLogin,
}) => {
  const isActive = (status || 'Active').toLowerCase() === 'active';

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#60A5FA] text-white shadow-lg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 top-6 h-[380px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-6 bottom-0 h-[260px] w-[360px] rounded-full bg-white/5 blur-2xl" />
      </div>

      <SkylineIllustration />

      <div className="relative z-10 flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        {/* Top row: avatar + greeting + employee info */}
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[auto_minmax(0,1fr)_minmax(340px,1fr)] xl:gap-6">
          <div className="flex flex-col items-center gap-3 xl:items-start">
            <ProfileAvatar name={name} photoUrl={photoUrl} />
            <div className="flex max-w-[11rem] items-center justify-center gap-2 text-sm text-white/90 xl:justify-start">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <span className="break-words">{location || '—'}</span>
            </div>
          </div>

          <div className="min-w-0 text-center xl:pt-1 xl:text-left">
            <Greeting name={name} />
            <div className="mt-4 flex justify-center xl:justify-start">
              <InfoPills lastLogin={lastLogin} />
            </div>
          </div>

          <div className="w-fit max-w-full justify-self-start">
            <div className="rounded-2xl border border-white/25 bg-white/15 px-3.5 py-3 backdrop-blur-md sm:px-4">
              <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-[max-content_max-content] sm:items-start">
                <InfoField
                  label="Employee ID"
                  value={employeeId}
                  icon={<BadgeCheck className="h-3.5 w-3.5" />}
                  iconClassName="bg-sky-400 text-white"
                />
                <InfoField
                  label="Official Email"
                  value={officialEmail}
                  icon={<Mail className="h-3.5 w-3.5" />}
                  iconClassName="bg-rose-400 text-white"
                />
                <InfoField
                  label="Designation"
                  value={designation}
                  icon={<Briefcase className="h-3.5 w-3.5" />}
                  iconClassName="bg-amber-400 text-white"
                />
                <InfoField
                  label="Department"
                  value={department}
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  iconClassName="bg-emerald-400 text-white"
                />
                <InfoField
                  label="Manager"
                  value={manager}
                  icon={<UserRound className="h-3.5 w-3.5" />}
                  iconClassName="bg-violet-400 text-white"
                />
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-sm ${
                      isActive ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  >
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                  <div className="whitespace-nowrap">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">Status</p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-white">
                      {status?.trim() || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions — full width, equal columns */}
        <QuickActions />
      </div>
    </section>
  );
};

export default HeroDashboard;
