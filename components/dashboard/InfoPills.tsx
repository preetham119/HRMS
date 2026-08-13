'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { Clock, Repeat } from 'lucide-react';

interface InfoPillsProps {
  lastLogin?: string | null;
}

const InfoPills: FC<InfoPillsProps> = ({ lastLogin }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const currentTime = useMemo(
    () => now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [now],
  );

  const last = lastLogin ?? 'Today, 09:18 AM';

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
      <div className="flex h-11 items-center gap-3 rounded-full bg-white/15 px-4 backdrop-blur">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Clock className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight text-white">
          <div className="text-[11px] text-white/80">Current Time</div>
          <div className="text-sm font-semibold">{currentTime}</div>
        </div>
      </div>

      <div className="flex h-11 items-center gap-3 rounded-full bg-white/15 px-4 backdrop-blur">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Repeat className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight text-white">
          <div className="text-[11px] text-white/80">Last Login</div>
          <div className="text-sm font-semibold">{last}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoPills;
