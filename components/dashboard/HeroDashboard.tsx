'use client';

import { FC } from 'react';
import Greeting from './Greeting';
import ProfileAvatar from './ProfileAvatar';
import EmployeeStatus from './EmployeeStatus';
import InfoPills from './InfoPills';
import QuickActions from './QuickActions';
import SkylineIllustration from './SkylineIllustration';

interface HeroProps {
  employeeId?: string;
  name?: string;
  designation?: string;
  department?: string;
  location?: string;
  photoUrl?: string | null;
  lastLogin?: string | null;
}

const HeroDashboard: FC<HeroProps> = ({
  employeeId = 'EMP00125',
  name = 'Raj',
  location = 'Hyderabad, India',
  photoUrl = null,
  lastLogin,
}) => {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#60A5FA] text-white shadow-lg">
      {/* glossy overlays + decorative circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-16 top-6 w-[420px] h-[380px] bg-white/6 rounded-full blur-3xl mix-blend-overlay" />
        <div className="absolute -right-6 bottom-0 w-[360px] h-[260px] bg-white/4 rounded-full blur-2xl mix-blend-overlay" />
        <div className="absolute right-8 top-8 w-40 h-40 rounded-full bg-white/6" />
      </div>

      {/* skyline */}
      <SkylineIllustration />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 lg:py-8" style={{ height: 280 }}>
        <div className="flex w-full h-full items-start gap-6">
          {/* left profile */}
          <div className="flex-shrink-0 flex items-start">
            <div className="flex flex-col items-start">
              <ProfileAvatar name={name} photoUrl={photoUrl} />
              <div className="mt-3 flex items-center gap-2 text-sm text-white/90">
                <span className="inline-flex items-center justify-center rounded-full bg-white/10 w-7 h-7">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" fill="currentColor"/></svg>
                </span>
                <span>{location}</span>
              </div>
            </div>
          </div>

          {/* center content */}
          <div className="flex-1 flex flex-col justify-start">
            <div>
              <Greeting name={name} />
            </div>

            <div className="mt-4">
              <InfoPills lastLogin={lastLogin} />
            </div>
          </div>

          {/* right floating status card */}
          <div className="flex-shrink-0 flex items-start">
            <div className="relative">
              <div className="absolute -right-4 -top-6 rounded-xl bg-white/18 backdrop-blur-md border border-white/20 p-4 w-48">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/90">Employee ID</div>
                    <div className="mt-1 font-semibold text-white">{employeeId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-[#22C55E]" />
                    <div className="text-sm text-white/90">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom actions */}
        <div className="absolute left-6 right-6 bottom-5 z-20">
          <QuickActions />
        </div>
      </div>
    </section>
  );
};

export default HeroDashboard;