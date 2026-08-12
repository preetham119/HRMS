'use client';

import { FC } from 'react';

const SkylineIllustration: FC = () => (
  <svg className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.02" />
      </linearGradient>
    </defs>
    <g transform="translate(120,20)" fill="url(#g1)">
      <rect x="420" y="60" width="20" height="220" rx="3" />
      <rect x="470" y="30" width="80" height="250" rx="6" />
      <rect x="560" y="90" width="40" height="190" rx="4" />
      <circle cx="740" cy="40" r="28" />
      <ellipse cx="700" cy="90" rx="60" ry="18" />
      <rect x="620" y="140" width="24" height="150" rx="2" />
    </g>
  </svg>
);

export default SkylineIllustration;