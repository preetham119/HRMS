import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // typedRoutes is off for MVP deploy: optional catch-all routes like /performance/[[...slug]]
  // break Link href typing for "/performance" and similar unions.
  typedRoutes: false,
  transpilePackages: ['@mui/material', '@mui/icons-material', '@mui/system', '@mui/x-date-pickers'],
};

export default nextConfig;
