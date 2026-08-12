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

const Greeting: FC<GreetingProps> = ({ name = 'Raj' }) => {
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

  return (
    <div>
      <h2 className="text-[30px] font-bold leading-tight">
        {label}, <span className="font-extrabold">{name.split(' ')[0]}</span> <span className="ml-2">👋</span>
      </h2>
      <div className="mt-2 text-[16px] text-white/90">{dateText}</div>
      <div className="mt-2 text-[18px] font-semibold italic tracking-wide text-white/90">{dailyMessage}</div>
    </div>
  );
};

export default Greeting;