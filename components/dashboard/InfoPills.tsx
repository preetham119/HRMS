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
    <div className="flex flex-wrap gap-3">
      <div className="bg-white/15 backdrop-blur rounded-full px-4 h-11 flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div className="text-white">
          <div className="text-xs text-white/90">Current Time</div>
          <div className="font-semibold">{currentTime}</div>
        </div>
      </div>

      <div className="bg-white/15 backdrop-blur rounded-full px-4 h-11 flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
          <Repeat className="w-4 h-4 text-white" />
        </div>
        <div className="text-white">
          <div className="text-xs text-white/90">Last Login</div>
          <div className="font-semibold">{last}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoPills;