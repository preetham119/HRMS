'use client';

import { FC, useEffect, useMemo, useState } from 'react';

interface GreetingProps {
  name?: string;
}

const motivations = [
  'Have a productive day ahead.',
  'Focus on one important task today.',
  'Small steps make big progress.',
  'Make today count.',
  'Keep learning and keep growing.',
];

function getGreetingLabel(hour: number) {
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 23) return 'Good Evening';
  return 'Good Night';
}

const Greeting: FC<GreetingProps> = ({ name = '' }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const label = useMemo(() => getGreetingLabel(now.getHours()), [now]);
  const dateText = useMemo(
    () =>
      now.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [now],
  );

  const dailyMessage = motivations[now.getDate() % motivations.length];
  const firstName = name.trim().split(/\s+/).filter(Boolean)[0] || 'there';

  return (
    <div className="space-y-1.5">
      <h2 className="text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]">
        {label}, <span className="font-extrabold">{firstName}</span>{' '}
        <span aria-hidden>👋</span>
      </h2>
      <p className="text-[15px] text-white/90">{dateText}</p>
      <p className="text-[16px] font-medium italic tracking-wide text-white/90">{dailyMessage}</p>
    </div>
  );
};

export default Greeting;
