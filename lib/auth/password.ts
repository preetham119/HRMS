export const PASSWORD_MIN_LENGTH = 8;

/**
 * Mirrors the Supabase Auth password policy so the browser can show what is
 * missing before submitting, instead of surfacing the raw Supabase rejection.
 * Keep in sync with Authentication → Policies in the Supabase dashboard.
 */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (value: string) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'lower',
    label: 'One lowercase letter (a–z)',
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'upper',
    label: 'One uppercase letter (A–Z)',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'digit',
    label: 'One number (0–9)',
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: 'symbol',
    label: 'One symbol (e.g. ! @ # $ %)',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export function passwordIsValid(value: string) {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function firstPasswordProblem(value: string) {
  return PASSWORD_RULES.find((rule) => !rule.test(value))?.label ?? null;
}
