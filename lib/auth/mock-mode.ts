/** Local sandbox auth when Supabase is not configured. */
export function isMockAuthEnabled() {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK_AUTH;
  if (flag === 'true') return true;
  if (flag === 'false') return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  return (
    !url ||
    !key ||
    url.includes('your-project') ||
    key.includes('your_publishable')
  );
}
